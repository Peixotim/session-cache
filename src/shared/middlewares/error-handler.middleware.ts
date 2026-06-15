import {NextFunction, Request, Response} from "express";
import {AppError, HttpStatus, NotFoundError} from "../errors";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
    next(new NotFoundError(`Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    if (error instanceof AppError) {
        res.status(error.statusCode).json(error.toJSON());
        return;
    }

    console.error("[errorHandler] Erro não tratado:", error);

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: "InternalServerError",
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Erro interno do servidor.",
    });
}
