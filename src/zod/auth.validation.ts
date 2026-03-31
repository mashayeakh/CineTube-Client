import { z } from "zod"

export const loginZodSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
    password: z.string()
        .min(1, { message: "Password is required" })
        .min(6, { message: "Password must be at least 6 characters" }),
})

export type ILoginPayload = z.infer<typeof loginZodSchema>;

export const signupZodSchema = z.object({
    name: z.string().min(1, { message: "Full name is required" }),
    email: z.email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type ISignupPayload = z.infer<typeof signupZodSchema>;