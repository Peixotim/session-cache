import {NextFunction, Request, Response} from "express";
import {UserService} from "../service/user.service";
import {UserResponseDTO} from "../DTOs/user-response.dto";
import {HttpStatus, UnauthorizedError} from "../../shared/errors";

export class UserController {
    private service = new UserService();

    public async findByEmail(
        req: Request,
        res: Response<UserResponseDTO>,
        next: NextFunction,
    ): Promise<Response<UserResponseDTO> | void> {
        try {
            const email: string = req.params.email as string
            const user: UserResponseDTO = await this.service.findByEmail(email)
            return res.status(HttpStatus.OK).json(user)
        } catch (error) {
            next(error)
        }
    }

    public async getProfile(
        req: Request,
        res: Response<UserResponseDTO>,
        next: NextFunction,
    ): Promise<Response<UserResponseDTO> | void> {
        try {
            if (!req.user) {
                throw new UnauthorizedError("Not authenticated.")
            }
            const profile: UserResponseDTO = await this.service.getProfile(req.user.sub)
            return res.status(HttpStatus.OK).json(profile)
        } catch (error) {
            next(error)
        }
    }
}
