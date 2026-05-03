/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { httpClient } from "@/lib/axios/httpClient";
import { ISignupPayload, signupZodSchema } from "@/zod/auth.validation";

const extractSignupErrorMessage = (error: any): string => {
    const apiMessage = error?.response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
        return apiMessage;
    }

    console.log("error", error);
    console.log("error?.response", error?.response);
    console.log("error?.response?.data", error?.response?.data);
    console.log("error?.response?.data?.message", error?.response?.data?.message);

    const status = error?.response?.status;
    if (status === 409) {
        return "An account with this email already exists.";
    }

    if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
        return "The server is taking too long to respond. Please try again or check your email.";
    }

    return "Unable to create account right now. Please try again.";
};

export const signupAction = async (payload: ISignupPayload) => {
    const parsedPayload = signupZodSchema.safeParse(payload);

    if (!parsedPayload.success) {
        return {
            success: false,
            message: parsedPayload.error.issues[0]?.message || "Invalid signup input",
        };
    }

    const { name, email, password } = parsedPayload.data;

    try {
        const response = await httpClient.post("auth/user/register", { name, email, password });
        return response;
    } catch (error: any) {
        return {
            success: false,
            message: extractSignupErrorMessage(error),
        };
    }
};
