import {UserResponseDTO} from "../../users/DTOs/user-response.dto";
import {CreateUserDTO} from "../../users/DTOs/create-user.dto";
import {UserService} from "../../users/service/user.service";
import {ArgonService} from "./argon.service";
import {LoginDTO} from "../DTOs/login.dto";
import {LoginResponseDTO, RegisterResponseDTO} from "../DTOs/auth-response.dto";
import {User} from "../../users/model/user.entity";
import {AppError, InternalServerError, UnauthorizedError} from "../../shared/errors";
import {JwtService} from "./jwt.service";
import {SessionService} from "./session.service";
import {SessionData} from "../DTOs/session.dto";

export class AuthService {
    private userService: UserService = new UserService();
    private argonService: ArgonService = new ArgonService();
    private jwtService: JwtService = new JwtService();
    private sessionService: SessionService = new SessionService();

    //Gera Token
    private async authenticate(payload: LoginDTO): Promise<{ user: User; access_token: string }> {
        const user: User = await this.userService.getByEmail(payload.email)

        if (!await this.argonService.verify(user.password, payload.password)) {
            throw new UnauthorizedError("Invalid credentials.")
        }

        const access_token: string = this.jwtService.generateToken({
            sub: user.id,
            email: user.email,
        })

        return { user, access_token }
    }

    private buildLoginResponse(access_token: string): LoginResponseDTO {
        return {
            status: "success",
            message: "Authentication successful.",
            token_type: "Bearer",
            access_token,
        }
    }

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
            const { access_token } = await this.authenticate(payload)

            // Decode só pra pegar sub/exp e montar a sessão.
            const claims = this.jwtService.decode(access_token)!
            await this.sessionService.create(access_token, claims)

            return this.buildLoginResponse(access_token)
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error("[AuthService.login] Unexpected error:", error)
            throw new InternalServerError()
        }
    }


    public async loginWithoutSession(payload: LoginDTO): Promise<LoginResponseDTO> {
        try {
            const { access_token } = await this.authenticate(payload)
            return this.buildLoginResponse(access_token)
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error("[AuthService.loginWithoutSession] Unexpected error:", error)
            throw new InternalServerError()
        }
    }

    // Logout: revoga a sessão deste token (apaga a chave no Redis).
    public async logout(token: string): Promise<void> {
        await this.sessionService.revoke(token)
    }

    public async getActiveSessions(userId: string): Promise<SessionData[]> {
        return this.sessionService.getSessionsForUser(userId)
    }
}
