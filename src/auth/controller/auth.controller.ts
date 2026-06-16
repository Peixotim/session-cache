import {NextFunction, Request, Response} from "express";
import {AuthService} from "../service/auth.service";
import {CreateUserDTO} from "../../users/DTOs/create-user.dto";
import {LoginDTO} from "../DTOs/login.dto";
import {LoginResponseDTO, RegisterResponseDTO} from "../DTOs/auth-response.dto";
import {HttpStatus, UnauthorizedError} from "../../shared/errors";
import {SessionData} from "../DTOs/session.dto";

export class AuthController {
    private service = new AuthService()

    public async register(
        req: Request,
        res: Response<RegisterResponseDTO>,
        next: NextFunction,
    ): Promise<Response<RegisterResponseDTO> | void> {
        try {
            const payload: CreateUserDTO = req.body
            const result: RegisterResponseDTO = await this.service.register(payload)
            return res.status(HttpStatus.CREATED).json(result)
        } catch (error) {
            next(error)
        }
    }

    public async login(
        req: Request,
        res: Response<LoginResponseDTO>,
        next: NextFunction,
    ): Promise<Response<LoginResponseDTO> | void> {
        try {
            const payload: LoginDTO = req.body
            const result: LoginResponseDTO = await this.service.login(payload)
            return res.status(HttpStatus.OK).json(result)
        } catch (error) {
            next(error)
        }
    }

    public async loginWithoutSession(
        req: Request,
        res: Response<LoginResponseDTO>,
        next: NextFunction,
    ): Promise<Response<LoginResponseDTO> | void> {
        try {
            const payload: LoginDTO = req.body
            const result: LoginResponseDTO = await this.service.loginWithoutSession(payload)
            return res.status(HttpStatus.OK).json(result)
        } catch (error) {
            next(error)
        }
    }

    public async getActiveSessions(
        req: Request,
        res: Response<SessionData[]>,
        next: NextFunction,
    ): Promise<Response<SessionData[]> | void> {
        try {
            if (!req.user) throw new UnauthorizedError("Not authenticated.")
            const sessions: SessionData[] = await this.service.getActiveSessions(req.user.sub)
            return res.status(HttpStatus.OK).json(sessions)
        } catch (error) {
            next(error)
        }
    }

    public async logout(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> {
        try {
            const token: string = req.headers.authorization!.split(' ')[1]
            await this.service.logout(token)
            return res.status(HttpStatus.OK).json({
                status: "success",
                message: "Logged out successfully.",
            })
        } catch (error) {
            next(error)
        }
    }
}
