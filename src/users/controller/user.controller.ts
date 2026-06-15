import {NextFunction, Request, Response} from "express";
import {UserService} from "../service/user.service";
import {UserResponseDTO} from "../DTOs/user-response.dto";
import {HttpStatus} from "../../shared/errors";

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
}
