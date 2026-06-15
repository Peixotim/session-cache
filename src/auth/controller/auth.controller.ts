import {NextFunction, Request, Response} from "express";
import {AuthService} from "../service/auth.service";
import {CreateUserDTO} from "../../users/DTOs/create-user.dto";
import {LoginDTO} from "../DTOs/login.dto";
import {LoginResponseDTO, RegisterResponseDTO} from "../DTOs/auth-response.dto";
import {HttpStatus} from "../../shared/errors";

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
}
