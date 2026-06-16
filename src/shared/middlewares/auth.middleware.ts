import {Request, Response, NextFunction} from "express";
import {UnauthorizedError} from "../errors";
import {JwtService} from "../../auth/service/jwt.service";
import {SessionService} from "../../auth/service/session.service";

const jwtService = new JwtService();
const sessionService = new SessionService();

export async function AuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('Token not provided.');
        }

        const token: string = authHeader.split(' ')[1];

        const claims = jwtService.verifyToken(token);

        //verifica se tem sessao
        await sessionService.validate(token);

        req.user = claims;
        next();
    } catch (error) {
        next(error);
    }
}
