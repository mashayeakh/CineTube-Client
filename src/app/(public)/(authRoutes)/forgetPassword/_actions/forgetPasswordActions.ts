"use server"

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse, ApiErrorResponse } from "@/types/api.types";

export interface ForgetPasswordPayload {
    email: string;
}

export interface ResetPasswordPayload {
    email: string;
    otp: string;
    newPassword: string;
}

export const forgetPasswordAction = async (
    payload: ForgetPasswordPayload
): Promise<ApiResponse | ApiErrorResponse> => {
    const email = payload.email?.trim();

    if (!email) {
        return { success: false, message: "Email is required" };
    }

    try {
        const response = await httpClient.post("auth/user/forget-password", { email });
        return response;
    } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        const message =
            typeof err?.response?.data?.message === "string"
                ? err.response.data.message
                : "Failed to send OTP. Please try again.";
        return { success: false, message };
    }
};

export const resetPasswordAction = async (
    payload: ResetPasswordPayload
): Promise<ApiResponse | ApiErrorResponse> => {
    const email = payload.email?.trim();
    const otp = payload.otp?.trim();
    const newPassword = payload.newPassword;

    if (!email || !otp || !newPassword) {
        return { success: false, message: "All fields are required" };
    }

    if (newPassword.length < 6) {
        return { success: false, message: "Password must be at least 6 characters" };
    }

    try {
        const response = await httpClient.post("auth/user/reset-password", {
            email,
            otp,
            newPassword,
        });
        return response;
    } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        const message =
            typeof err?.response?.data?.message === "string"
                ? err.response.data.message
                : "Failed to reset password. Please try again.";
        return { success: false, message };
    }
};
