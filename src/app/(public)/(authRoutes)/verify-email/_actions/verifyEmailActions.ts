"use server"

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse, ApiErrorResponse } from "@/types/api.types";

export interface VerifyEmailPayload {
    email: string;
    otp: string;
}

export const verifyEmailAction = async (
    payload: VerifyEmailPayload
): Promise<ApiResponse | ApiErrorResponse> => {
    const email = payload.email?.trim();
    const otp = payload.otp?.trim();

    if (!email || !otp) {
        return { success: false, message: "Email and OTP are required" };
    }

    try {
        const response = await httpClient.post("auth/user/verify-email", { email, otp });
        return response;
    } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        const message =
            typeof err?.response?.data?.message === "string"
                ? err.response.data.message
                : "Failed to verify email. Please try again.";
        return { success: false, message };
    }
};
