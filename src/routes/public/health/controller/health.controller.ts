import {Request, Response} from "express";
import {configDotenv} from "dotenv";
import {HttpStatus} from "../../../../shared/errors";

configDotenv();

interface HealthResponseDTO {
    status: "OK";
    timestamp: string;
    environment: string | undefined;
}

export class HealthController {
    public async HealthCheck(
        req: Request,
        res: Response<HealthResponseDTO>,
    ): Promise<Response<HealthResponseDTO>> {
        return res.status(HttpStatus.OK).json({
            status: "OK",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
        })
    }
}
