import {NextFunction, Request, Response} from "express";
import {ZodType} from "zod";
import {BadRequestError} from "../errors";

export function validateBody<T>(schema: ZodType<T>) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const details = result.error.issues.map((issue) => ({
                field: issue.path.join(".") || "(body)",
                message: issue.message,
            }));
            return next(new BadRequestError("Validation failed.", details));
        }

        req.body = result.data;
        next();
    };
}
