import {UserResponseDTO} from "../../users/DTOs/user-response.dto";
import {CreateUserDTO} from "../../users/DTOs/create-user.dto";
import {UserService} from "../../users/service/user.service";
import {ArgonService} from "./argon.service";
import {LoginDTO} from "../DTOs/login.dto";
import {LoginResponseDTO, RegisterResponseDTO} from "../DTOs/auth-response.dto";
import {User} from "../../users/model/user.entity";
import {AppError, InternalServerError, UnauthorizedError} from "../../shared/errors";
import {JwtService} from "./jwt.service";

export class AuthService {
    private userService: UserService = new UserService();
    private argonService: ArgonService = new ArgonService();
    private jwtService: JwtService = new JwtService();

    public async register(payload: CreateUserDTO): Promise<RegisterResponseDTO> {
        const user: UserResponseDTO = await this.userService.create(payload);

        return {
            status: "success",
            message: "User registered successfully.",
            user,
        };
    }

    public async login(payload: LoginDTO): Promise<LoginResponseDTO> {
        try {
            const user: User = await this.userService.getByEmail(payload.email)

            if (!await this.argonService.verify(user.password, payload.password)) {
                throw new UnauthorizedError("Invalid credentials.")
            }

            const access_token: string = this.jwtService.generateToken({
                sub: user.id,
                email: user.email,
            })

            return {
                status: "success",
                message: "Authentication successful.",
                token_type: "Bearer",
                access_token,
            }
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error("[AuthService.login] Unexpected error:", error)
            throw new InternalServerError()
        }
    }
}
