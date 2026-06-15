import { HttpStatus } from "./http-status.enum";

export abstract class AppError extends Error {
    public readonly statusCode: HttpStatus;
    public readonly isOperational: boolean;
    public readonly details?: unknown;

    protected constructor(
        message: string,
        statusCode: HttpStatus,
        details?: unknown,
        isOperational = true,
    ) {
        super(message);
        this.name = new.target.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;

        Error.captureStackTrace(this, new.target);
    }


    public toJSON() {
        return {
            error: this.name,
            statusCode: this.statusCode,
            message: this.message,
            ...(this.details !== undefined ? { details: this.details } : {}),
        };
    }
}

/** 400 - Requisição malformada ou com dados inválidos. */
export class BadRequestError extends AppError {
    constructor(message = "Requisição inválida.", details?: unknown) {
        super(message, HttpStatus.BAD_REQUEST, details);
    }
}

/** 401 - Credenciais ausentes ou inválidas. */
export class UnauthorizedError extends AppError {
    constructor(message = "Não autorizado.", details?: unknown) {
        super(message, HttpStatus.UNAUTHORIZED, details);
    }
}

/** 403 - Autenticado, porém sem permissão para o recurso. */
export class ForbiddenError extends AppError {
    constructor(message = "Acesso negado.", details?: unknown) {
        super(message, HttpStatus.FORBIDDEN, details);
    }
}

/** 404 - Recurso não encontrado. */
export class NotFoundError extends AppError {
    constructor(message = "Recurso não encontrado.", details?: unknown) {
        super(message, HttpStatus.NOT_FOUND, details);
    }
}

/** 409 - Conflito de estado (ex.: recurso já existente). */
export class ConflictError extends AppError {
    constructor(message = "Conflito de dados.", details?: unknown) {
        super(message, HttpStatus.CONFLICT, details);
    }
}

/** 422 - Entidade sintaticamente válida, mas semanticamente incorreta. */
export class UnprocessableEntityError extends AppError {
    constructor(message = "Não foi possível processar a entidade.", details?: unknown) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY, details);
    }
}

/** 429 - Excesso de requisições. */
export class TooManyRequestsError extends AppError {
    constructor(message = "Muitas requisições. Tente novamente mais tarde.", details?: unknown) {
        super(message, HttpStatus.TOO_MANY_REQUESTS, details);
    }
}

/**
 * 500 - Falha inesperada. Usado para encapsular erros não operacionais
 * (ex.: exceções de bibliotecas) sem expor detalhes internos ao cliente.
 */
export class InternalServerError extends AppError {
    constructor(message = "Erro interno do servidor.", details?: unknown) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, details, false);
    }
}

/** 503 - Dependência externa indisponível (ex.: banco, cache). */
export class ServiceUnavailableError extends AppError {
    constructor(message = "Serviço temporariamente indisponível.", details?: unknown) {
        super(message, HttpStatus.SERVICE_UNAVAILABLE, details);
    }
}
