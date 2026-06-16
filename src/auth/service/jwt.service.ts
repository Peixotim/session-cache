import jwt, { SignOptions, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken'
import { UnauthorizedError } from '../../shared/errors'
import {JwtPayload, JwtClaims} from "../../utils/jwt";
import {env} from "../../shared/env/env";

const SECRET : string = env.JWT_SECRET ?? 'secret'
const EXPIRES_IN = (env.JWT_EXPIRES_IN ?? '15m') as SignOptions['expiresIn']

export class JwtService {

    public generateToken(payload: JwtPayload): string {
        return jwt.sign({ email: payload.email }, SECRET, {
            subject: payload.sub,
            expiresIn: EXPIRES_IN,
        })
    }

    public decode(token: string): JwtClaims | null {
        return jwt.decode(token) as JwtClaims | null

    }

    public verifyToken(token: string): JwtClaims {
        try {
            return jwt.verify(token, SECRET) as JwtClaims
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new UnauthorizedError('Token expired')
            }
            if (error instanceof JsonWebTokenError) {
                throw new UnauthorizedError('Invalid token')
            }
            throw error
        }
    }
}
