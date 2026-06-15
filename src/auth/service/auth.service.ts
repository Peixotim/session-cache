import {UserResponseDTO} from "../../users/DTOs/user-response.dto";
import {CreateUserDTO} from "../../users/DTOs/create-user.dto";
import {UserService} from "../../users/service/user.service";
import {ArgonService} from "./argon.service";
import {LoginDTO} from "../DTOs/login.dto";
import {User} from "../../users/model/user.entity";
import {AppError, InternalServerError, UnauthorizedError} from "../../shared/errors";
import {JwtService} from "./jwt.service";

export class AuthService {
    private userService: UserService = new UserService();
    private argonService: ArgonService = new ArgonService();
    private jwtService: JwtService = new JwtService();

    public async register(payload: CreateUserDTO): Promise<UserResponseDTO> {
        return this.userService.create(payload);
    }

    public async login(payload: LoginDTO): Promise<{ access_token: string }> {
        try {
            const user: User = await this.userService.getByEmail(payload.email)

            if (!await this.argonService.verify(user.password, payload.password)) {
                throw new UnauthorizedError("Invalid credentials.")
            }

            const access_token: string = this.jwtService.generateToken({
                sub: user.id,
                email: user.email,
            })

            return { access_token }
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error("[AuthService.login] Unexpected error:", error)
            throw new InternalServerError()
        }
    }
}
