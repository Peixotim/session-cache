import {UserRepository} from "../repository/user.repository";
import {UserResponseDTO} from "../DTOs/user-response.dto";
import {CreateUserDTO} from "../DTOs/create-user.dto";
import {ArgonService} from "../../auth/service/argon.service";
import {User} from "../model/user.entity";
import {AppError, BadRequestError, ConflictError, InternalServerError, NotFoundError} from "../../shared/errors";

export class UserService {
    private repository = new UserRepository()
    private argonService = new ArgonService()

    public async create(payload: CreateUserDTO): Promise<UserResponseDTO> {
        try {
            if (!payload) {
                throw new BadRequestError("User payload is required.")
            }

            if (await this.repository.findByEmail(payload.email) != null) {
                throw new ConflictError("A user with this email already exists.")
            }

            const hash: string = await this.argonService.hash(payload.password)
            const newUser: User = await this.repository.create({
                name: payload.name,
                email: payload.email,
                password: hash,
            })

            return { name: newUser.name, email: newUser.email }
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error("[UserService.create] Unexpected error:", error)
            throw new InternalServerError("Failed to create user.")
        }
    }

    public async getByEmail(email: string): Promise<User> {
        try {
            const user: User | null = await this.repository.findByEmail(email)
            if (user == null) {
                throw new NotFoundError("User not found.")
            }
            return user
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error("[UserService.getByEmail] Unexpected error:", error)
            throw new InternalServerError("Failed to retrieve user.")
        }
    }

    public async findByEmail(email: string): Promise<UserResponseDTO> {
        try {
            const user: User | null = await this.repository.findByEmail(email)
            if (!user) {
                throw new NotFoundError("User not found.")
            }
            return { name: user.name, email: user.email }
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error("[UserService.findByEmail] Unexpected error:", error)
            throw new InternalServerError("Failed to retrieve user.")
        }
    }
}
