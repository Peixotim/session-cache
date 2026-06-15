import {Request , Response} from "express";
import {configDotenv} from "dotenv";
configDotenv();

export class HealthController{
    public async HealthCheck(req : Request, res: Response){
        try{
            return res.status(200).json({
                status : "OK",
                timestamp : new Date().toISOString(),
                environment: process.env.NODE_ENV
            })
        }catch(error){
            console.error(error)
        }
    }
}
