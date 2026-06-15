import * as argon2 from "argon2";
import {InternalServerError} from "../../shared/errors";

const ARGON2_CONFIG: argon2.Options & {raw?: false} = {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
    hashLength: 32,
}

export class ArgonService {
    public async hash(password: string): Promise<string> {
        try {
            return await argon2.hash(password, ARGON2_CONFIG)
        } catch (error) {
            console.error("[ArgonService.hash] Failed to hash password:", error)
            throw new InternalServerError("Failed to process password.")
        }
    }

    public async verify(hash: string, password: string): Promise<boolean> {
        try {
            return await argon2.verify(hash, password)
        } catch (error) {
            console.error("[ArgonService.verify] Failed to verify password:", error)
            throw new InternalServerError("Failed to validate password.")
        }
    }
}
