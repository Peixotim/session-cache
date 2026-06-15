import express from 'express'
import { AppDataSource } from '../infra/database/database'
import "reflect-metadata"
import { errorHandler, notFoundHandler } from './shared/middlewares'
import { routes } from './routes'

const app = express();
app.use(express.json())

app.use('/api', routes)

app.use(notFoundHandler)
app.use(errorHandler)

async function bootStrap(){
    try{
        await AppDataSource.initialize()
        app.listen(8080,()  => {
            console.log('Api is running in port 8080')
        })
    }catch(error){
        console.error(error);
    }
}

bootStrap()