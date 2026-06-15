import {NextFunction, Request, Response} from "express";
import {AuthService} from "../service/auth.service";
import {CreateUserDTO} from "../../users/DTOs/create-user.dto";
import {LoginDTO} from "../DTOs/login.dto";
import {HttpStatus} from "../../shared/errors";

export class AuthController {
    private service = new AuthService()

    public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const payload: CreateUserDTO = req.body
            const user = await this.service.register(payload)
            res.status(HttpStatus.CREATED).json(user)
        } catch (error) {
            next(error)
        }
    }

    public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const payload: LoginDTO = req.body
            const token = await this.service.login(payload)
            res.status(HttpStatus.OK).json(token)
        } catch (error) {
            next(error)
        }
    }
}
