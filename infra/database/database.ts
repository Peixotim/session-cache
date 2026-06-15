import {DataSource} from "typeorm";
import {configDotenv} from "dotenv";
import {User} from "../../src/users/model/user.entity";
configDotenv();

export const AppDataSource = new DataSource({
    type : 'postgres',
    host : process.env.DATABASE_HOST,
    port : Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize:true,
    entities:[User]
})