import {Request, Response} from "express";

import {HttpStatus} from "../../../../shared/errors";
import {env} from "../../../../shared/env/env";


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
            environment: env.NODE_ENV,
        })
    }
}
