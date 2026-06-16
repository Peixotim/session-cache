import express from 'express'
import { AppDataSource } from '../infra/database/database'
import "reflect-metadata"
import { errorHandler, notFoundHandler } from './shared/middlewares'
import { routes } from './routes'
import redis from "../infra/database/redis";

const app = express();
app.use(express.json())

app.use('/api', routes)

app.use(notFoundHandler)
app.use(errorHandler)

async function bootStrap(){
    try{
        await AppDataSource.initialize()
        await redis.ping();
        app.listen(8080,()  => {
            console.log('Api is running in port 8080')
        })
    }catch(error){
        const message = error instanceof Error ? error.message : String(error)

        console.error(`Failed to start the application: ${message}`)
        if (error instanceof Error && error.stack) {
            console.error(error.stack)
        }

        process.exit(1)
    }
}

bootStrap()