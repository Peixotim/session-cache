import { HttpStatus } from "./http-status.enum";

export abstract class AppError extends Error {
    public readonly statusCode: HttpStatus;
    public readonly isOperational: boolean;
    public readonly details?: unknown;

    protected constructor(
        message: string,
        statusCode: HttpStatus,
        details?: unknown,
        isOperational = true,
    ) {
        super(message);
        this.name = new.target.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;

        Error.captureStackTrace(this, new.target);
    }


    public toJSON() {
        return {
            error: this.name,
            statusCode: this.statusCode,
            message: this.message,
            ...(this.details !== undefined ? { details: this.details } : {}),
        };
    }
}

export class BadRequestError extends AppError {
    constructor(message = "Bad request.", details?: unknown) {
        super(message, HttpStatus.BAD_REQUEST, details);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized.", details?: unknown) {
        super(message, HttpStatus.UNAUTHORIZED, details);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = "Access denied.", details?: unknown) {
        super(message, HttpStatus.FORBIDDEN, details);
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found.", details?: unknown) {
        super(message, HttpStatus.NOT_FOUND, details);
    }
}

export class ConflictError extends AppError {
    constructor(message = "Data conflict.", details?: unknown) {
        super(message, HttpStatus.CONFLICT, details);
    }
}

export class UnprocessableEntityError extends AppError {
    constructor(message = "Unprocessable entity.", details?: unknown) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY, details);
    }
}

export class TooManyRequestsError extends AppError {
    constructor(message = "Too many requests. Please try again later.", details?: unknown) {
        super(message, HttpStatus.TOO_MANY_REQUESTS, details);
    }
}

export class InternalServerError extends AppError {
    constructor(message = "Internal server error.", details?: unknown) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, details, false);
    }
}

export class ServiceUnavailableError extends AppError {
    constructor(message = "Service temporarily unavailable.", details?: unknown) {
        super(message, HttpStatus.SERVICE_UNAVAILABLE, details);
    }
}
