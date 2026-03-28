import { z } from "zod"

export const loginZodSchema =z.object( {
    email: z.email({ message: "Invalid email address" }),
    password: z.string()
        .min(1, { message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" }),
})


export type ILoginPayload = z.infer<typeof loginZodSchema>;