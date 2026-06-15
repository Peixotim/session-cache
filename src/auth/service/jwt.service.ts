import jwt, { SignOptions, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken'
import { UnauthorizedError } from '../../shared/errors'
import {JwtPayload, JwtClaims} from "../../utils/jwt";


const SECRET : string = process.env.JWT_SECRET ?? 'secret'
const EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '15m') as SignOptions['expiresIn']

export class JwtService {

    public generateToken(payload: JwtPayload): string {
        return jwt.sign({ email: payload.email }, SECRET, {
            subject: payload.sub,
            expiresIn: EXPIRES_IN,
        })
    }

    public verifyToken(token: string): JwtClaims {
        try {
            return jwt.verify(token, SECRET) as JwtClaims
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new UnauthorizedError('Token expirado.')
            }
            if (error instanceof JsonWebTokenError) {
                throw new UnauthorizedError('Token inválido.')
            }
            throw error
        }
    }
}
