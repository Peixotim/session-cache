# session-cache

API REST em Node.js que implementa **gerenciamento de sessão via allowlist no Redis** sobre JWT stateless. O objetivo é resolver um problema real de produção: como revogar um access token de longa duração sem refresh tokens.

---

## O problema que esta solução resolve

O modelo padrão com JWT é completamente **stateless**: uma vez emitido, o token é válido até expirar. O servidor não tem como invalidá-lo antes disso.

```
Token emitido com 12h de vida
        │
        ▼
Usuário tem conta comprometida às 2h
        │
        ▼
Atacante explora o sistema por mais 10h    ← não há o que fazer
```

A abordagem comum para mitigar isso é usar refresh tokens com access tokens de curta duração (5–15 min). Mas e quando você **não pode alterar o fluxo de emissão do token**?

---

## A solução: Shadow Session com Allowlist

Em vez de confiar só na assinatura do JWT, toda request protegida passa por **dois portões**:

```
Request  ──► Portão 1: assinatura JWT válida e não expirado?
                 │
                 ▼
             Portão 2: existe sessão ATIVA no Redis para este token?
                 │
                 ▼
              next()  /  401 Unauthorized
```

A sessão é uma entrada no Redis cuja chave é o **hash SHA-256 do token**. Revogar = deletar a chave. Instantâneo. O token pode ter 10h de vida útil restante — não importa, sem a chave no Redis ele não passa.

### Por que SHA-256 e não o token direto?

O Redis nunca armazena o bearer token em si. Se o banco em memória for comprometido, o atacante vê apenas hashes irreversíveis — não tokens prontos para replay. É _defense in depth_.

### Por que allowlist e não denylist?

| Denylist | Allowlist |
|---|---|
| Guarda tokens *revogados* | Guarda tokens *permitidos* |
| Qualquer token não listado **passa** | Qualquer token não listado **é barrado** |
| Padrão mais frágil | Padrão mais seguro |

Com allowlist, um token sem sessão registrada (ex.: emitido antes do sistema existir, ou de outro ambiente) é barrado automaticamente.

---

## Fluxo completo

```
┌─────────────────────────────────────────────────────────────────┐
│  LOGIN                                                          │
│                                                                 │
│  1. Valida credenciais (email + senha com Argon2)              │
│  2. Gera JWT (sub=userId, email, exp)                          │
│  3. sha256(token) → chave da sessão                            │
│  4. SET session:<hash> {userId, status:"active"} EX <ttl>      │
│  5. SADD user:<userId>:sessions <hash>   ← índice por usuário  │
│  6. Retorna access_token                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  REQUEST PROTEGIDA  (ex.: GET /api/users/me)                   │
│                                                                 │
│  AuthMiddleware:                                                │
│    Portão 1 → jwt.verify(token, secret)  ──► inválido = 401   │
│    Portão 2 → GET session:<sha256(token)> ──► null    = 401   │
│              └── session.status !== "active"  ──────── = 401  │
│    ok → req.user = claims → next()                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  LOGOUT                                                         │
│                                                                 │
│  DEL session:<sha256(token)>                                    │
│  O token ainda tem assinatura válida, mas agora falha          │
│  no Portão 2 em qualquer request subsequente.                  │
└─────────────────────────────────────────────────────────────────┘
```

### TTL = vida do token

O TTL da chave no Redis é calculado como `exp - now` no momento do login. Quando o JWT expira naturalmente, a chave Redis desaparece sozinha. Sem job de limpeza, sem chaves órfãs.

### Índice por usuário

O Set `user:<userId>:sessions` mantém os hashes de todas as sessões abertas de um usuário. Isso permite:

```
revokeAllForUser(userId)  →  DEL de todas as sessões de uma vez
```

Útil em cenários de conta comprometida onde você precisa derrubar **todos** os dispositivos simultaneamente.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express 5 |
| Banco relacional | PostgreSQL 16 (TypeORM) |
| Cache / sessões | Redis 7 (ioredis) |
| Autenticação | JWT (jsonwebtoken) |
| Hash de senha | Argon2 |
| Validação | Zod |
| Infraestrutura | Docker Compose |

---

## Estrutura do projeto

```
src/
├── auth/
│   ├── controller/       auth.controller.ts
│   ├── DTOs/             auth-response.dto.ts  login.dto.ts  session.dto.ts
│   ├── routes/           auth.routes.ts
│   └── service/
│       ├── auth.service.ts      ← orquestra login, logout, sessões
│       ├── jwt.service.ts       ← emissão e verificação de tokens
│       ├── argon.service.ts     ← hash e verificação de senhas
│       └── session.service.ts   ← allowlist no Redis
├── users/
│   ├── controller/       user.controller.ts
│   ├── DTOs/             create-user.dto.ts  user-response.dto.ts
│   ├── model/            user.entity.ts
│   ├── repository/       user.repository.ts
│   ├── routes/           user.routes.ts
│   └── service/          user.service.ts
├── shared/
│   ├── errors/           app-error.ts  http-status.enum.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts        ← os dois portões
│   │   ├── error-handler.middleware.ts
│   │   └── validation.middleware.ts
│   ├── env/              env.ts       ← validação de variáveis de ambiente (Zod)
│   └── types/            express.d.ts ← extensão de Request com req.user
├── routes/               index.ts
└── utils/                jwt.ts       ← interfaces JwtPayload / JwtClaims

infra/
├── database/
│   ├── database.ts       ← DataSource TypeORM
│   └── redis.ts          ← cliente ioredis singleton
```

---

## Endpoints

### Auth — `/api/auth`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/register` | ❌ | Cria um novo usuário |
| `POST` | `/login` | ❌ | Autentica e **cria sessão** no Redis |
| `POST` | `/login-no-session` | ❌ | Autentica sem criar sessão _(endpoint de teste)_ |
| `POST` | `/logout` | ✅ | Revoga a sessão do token atual |
| `GET` | `/sessions` | ✅ | Lista todas as sessões ativas do usuário |

### Users — `/api/users`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/me` | ✅ | Retorna o perfil do usuário autenticado |
| `GET` | `/email/:email` | ❌ | Busca usuário por e-mail |

### Health — `/api/health`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/` | ❌ | Verifica se a API está no ar |

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
NODE_ENV=dev
PORT=8080

# PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=session_cache

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis

# JWT
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRES_IN=15m
```

---

## Como rodar

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

### 1. Instalar dependências

```bash
npm install
```

### 2. Subir a infraestrutura

```bash
npm run infra
# equivale a: docker compose up -d
# sobe PostgreSQL 16 e Redis 7 com as configs do .env
```

### 3. Iniciar a API em modo desenvolvimento

```bash
npm run dev
```

A API estará disponível em `http://localhost:8080`.

---

## Cenários de teste

O endpoint `/login-no-session` foi criado especificamente para demonstrar e testar o comportamento da allowlist sem precisar alterar código.

### Cenário 1 — Token sem sessão é barrado

```bash
# 1. Login sem sessão → token válido mas sem entrada no Redis
POST /api/auth/login-no-session
{ "email": "user@example.com", "password": "senha123" }

# 2. Tentar acessar rota protegida
GET /api/users/me
Authorization: Bearer <token>

# → 401 Unauthorized: "No active session."
#   Portão 1 passa (assinatura ok), Portão 2 barra (sem chave no Redis)
```

### Cenário 2 — Fluxo completo com sessão

```bash
# 1. Login real → cria sessão no Redis
POST /api/auth/login
{ "email": "user@example.com", "password": "senha123" }

# 2. Acessar rota protegida
GET /api/users/me
Authorization: Bearer <token>
# → 200 OK: { "id": "...", "name": "...", "email": "..." }

# 3. Ver sessões ativas
GET /api/auth/sessions
Authorization: Bearer <token>
# → 200 OK: [{ "userId": "...", "status": "active", "createdAt": "..." }]
```

### Cenário 3 — Revogação instantânea

```bash
# 1. Login em dois "dispositivos" (duas chamadas ao /login)
POST /api/auth/login  →  token_A
POST /api/auth/login  →  token_B

# 2. Logout com token_A
POST /api/auth/logout
Authorization: Bearer <token_A>
# → 200 OK: "Logged out successfully."

# 3. token_A está morto, token_B continua vivo
GET /api/users/me  (com token_A)  →  401 "No active session."
GET /api/users/me  (com token_B)  →  200 OK

# 4. Sessões ativas com token_B: apenas 1 restante
GET /api/auth/sessions
Authorization: Bearer <token_B>
# → [{ "userId": "...", "status": "active", "createdAt": "..." }]
```

---

## Dados no Redis

Para inspecionar as sessões diretamente no Redis durante o desenvolvimento:

```bash
# Entrar no container
docker exec -it session-cache-redis redis-cli -a <REDIS_PASSWORD>

# Listar todas as chaves de sessão
KEYS session:*

# Ver dados de uma sessão específica
GET session:<hash>

# Ver hashes das sessões de um usuário
SMEMBERS user:<userId>:sessions

# Revogar manualmente uma sessão
DEL session:<hash>
```

---

## Decisões de design

**SHA-256 como chave da sessão** — o token nunca entra no Redis. Um dump do Redis expõe apenas hashes irreversíveis, não bearer tokens prontos para replay.

**TTL = expiração do token** — calculado como `exp - now` no momento do login. Quando o JWT expira, a chave some sozinha. Zero manutenção.

**`mget` para listar sessões** — a listagem de sessões busca todos os dados com uma única viagem ao Redis, independentemente do número de sessões abertas.

**Pipeline `multi()` no login** — o `SET` da sessão e o `SADD` no índice do usuário são enviados como pipeline atômico. Os dois chegam juntos ou nenhum chega.

**`sub` como identificador** — rotas protegidas identificam o usuário pelo claim `sub` do JWT (o UUID do banco), não pelo email. O `sub` é imutável; o email pode mudar.
