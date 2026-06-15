import {UserRepository} from "../repository/user.repository";
import {UserResponseDTO} from "../DTO/user-response.dto";
import {CreateUserDTO} from "../DTO/create-user.dto";
import {ArgonService} from "../../login/service/argon.service";
import {User} from "../model/user.entity";
import {AppError, BadRequestError, ConflictError, InternalServerError, NotFoundError} from "../../shared/errors";
import {Not} from "typeorm";

export class UserService{
    private repository = new UserRepository()
    private argonService = new ArgonService()

    public async create(payload: CreateUserDTO): Promise<UserResponseDTO>{
        try{

            if(!payload){
                throw new BadRequestError("O payload do usuário é obrigatório.");
            }

            if(await this.repository.findByEmail(payload.email) != null){
                throw new ConflictError("Já existe um usuário cadastrado com este e-mail.");
            }

            const hash : string = await this.argonService.hash(payload.password);
            const newUser : User = await this.repository.create({
                name: payload.name,
                email: payload.email,
                password: hash
            })

            return {
                name: newUser.name,
                email: newUser.email
            }

        }catch(error){

            if (error instanceof AppError) {
                throw error;
            }

            console.error("[UserService.create] Erro inesperado:", error);
            throw new InternalServerError("Não foi possível criar o usuário.");
        }
    }

    public async findByEmail(email : string): Promise<UserResponseDTO>{
        try{
            const user : User | null = await this.repository.findByEmail(email);
            if(!user){
                throw new NotFoundError("Not Found User")
            }

            return {
                name: user.name,
                email: user.email
            }
        }catch(error){

            if (error instanceof AppError) {
                throw error;
            }

            console.error("[UserService.create] Erro inesperado:", error);
            throw new InternalServerError("Not Found User");
        }
    }
}
