import {NextFunction, Request, Response} from "express";
import {AppError, HttpStatus, NotFoundError} from "../errors";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
    next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
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

    console.error("[errorHandler] Unhandled error:", error);

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: "InternalServerError",
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal server error.",
    });
}
