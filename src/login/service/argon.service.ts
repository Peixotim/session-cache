import * as argon2 from "argon2";
import {InternalServerError} from "../../shared/errors";


const ARGON2_CONFIG: argon2.Options & {raw?: false} = {
    type: argon2.argon2id,
    memoryCost:65536,
    timeCost: 3,
    parallelism:4,
    hashLength:32,
}
export class ArgonService{
    public async hash(password : string):Promise<string>{
          try{
              return await argon2.hash(password,ARGON2_CONFIG)
          }catch(error){
              // Falha no hashing é sempre inesperada (problema de runtime/lib).
              console.error("[ArgonService.hash] Falha ao gerar hash da senha:", error)
              throw new InternalServerError("Não foi possível processar a senha.")
          }
    }
    public async verify(hash: string, password: string):Promise<boolean>{
        try{
            return await argon2.verify(hash,password);
        }catch(error){
            console.error("[ArgonService.verify] Falha ao verificar a senha:", error)
            throw new InternalServerError("Não foi possível validar a senha.")
        }
    }
}