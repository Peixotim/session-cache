import {CreateUserDTO } from "../DTO/create-user.dto";
import {User} from "../model/user.entity";
import {AppDataSource} from "../../../infra/database/database";

export class UserRepository{
    private repository = AppDataSource.getRepository(User)

    public async create(payload: CreateUserDTO):Promise<User>{
        const create:User = this.repository.create({
            name: payload.name,
            email: payload.email,
            password: payload.password
        })
        return this.repository.save(create)
    }

    public async findByEmail(email : string):Promise<User | null>{
        return await this.repository.findOne({
            where:{email}
        })
    }
}