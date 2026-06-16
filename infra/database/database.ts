import {DataSource} from "typeorm";
import {User} from "../../src/users/model/user.entity";
import {env} from "../../src/shared/env/env";


export const AppDataSource = new DataSource({
    type : 'postgres',
    host : env.DATABASE_HOST,
    port : env.DATABASE_PORT,
    username: env.DATABASE_USERNAME,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    synchronize:true,
    entities:[User]
})