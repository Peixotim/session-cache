import {z} from "zod";

export const createUserSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters long.")
        .max(100, "Name must be at most 100 characters long."),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("A valid email address is required."),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long.")
        .max(128, "Password must be at most 128 characters long."),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
