import {config} from "dotenv";
import {z} from "zod";

config();

const envSchema = z.object({
    NODE_ENV: z
        .enum(["dev", "test", "production"])
        .default("dev"),
    PORT: z.coerce.number().int().positive().default(8080),

    // PostgreSQL
    DATABASE_HOST: z.string().min(1, "DATABASE_HOST is required."),
    DATABASE_PORT: z.coerce.number().int().positive(),
    DATABASE_USERNAME: z.string().min(1, "DATABASE_USERNAME is required."),
    DATABASE_PASSWORD: z.string().min(1, "DATABASE_PASSWORD is required."),
    DATABASE_NAME: z.string().min(1, "DATABASE_NAME is required."),

    // Redis
    REDIS_HOST: z.string().min(1, "REDIS_HOST is required."),
    REDIS_PORT: z.coerce.number().int().positive(),
    REDIS_PASSWORD: z.string().min(1, "REDIS_PASSWORD is required."),

    // JWT
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required."),
    JWT_EXPIRES_IN: z.string().min(1, "JWT_EXPIRES_IN is required."),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    const issues = result.error.issues
        .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
        .join("\n");

    console.error(`Invalid environment variables:\n${issues}`);
    process.exit(1);
}

export const env = result.data;
export type Env = typeof env;
