/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { getDefaultDashboardRoute, UserRole } from "@/lib/authUtils";
import { httpClient } from "@/lib/axios/httpClient";
import { isValidRedirectForRole } from "@/lib/axios/jwtUtils";
import { setTokenInCookie } from "@/lib/token.utils";
import { ApiResponse } from "@/types/api.types";
import { ApiErrorResponse } from "@/types/api.types";
import { ILoginResponse } from "@/types/auth.types";
import { ILoginPayload, loginZodSchema } from "@/zod/auth.validation";

const extractLoginErrorMessage = (error: any): string => {
    const apiMessage = error?.response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
        return apiMessage;
    }

    const status = error?.response?.status;
    if (status === 401) {
        return "Incorrect email or password.";
    }

    return "Unable to login right now. Please try again.";
};

export const loginAction = async (payload: ILoginPayload, redirectPath?: string): Promise<ApiResponse<ILoginResponse> | ApiErrorResponse> => {

    const parsedPayload = loginZodSchema.safeParse(payload);

    if (!parsedPayload.success) {
        // throw new Error("Invalid login payload");
        const firstError = parsedPayload.error.issues[0].message || "Invalid login input";
        return {
            success: false,
            message: firstError
        }
    }

    try {
        const response = await httpClient.post<ILoginResponse>("auth/user/login", parsedPayload.data);

        console.log("response result", response.result)

        const { accessToken, refreshToken, token, user } = response.result

        const { role, emailVerified } = user

        await setTokenInCookie("accessToken", accessToken);
        await setTokenInCookie("refreshToken", refreshToken);
        await setTokenInCookie("better-auth.session_token", token, 24 * 60 * 60); // 1 day in seconds

        const targetPath = !emailVerified
            ? "/verify-email"
            : redirectPath && isValidRedirectForRole(redirectPath, role as UserRole)
                ? redirectPath
                : getDefaultDashboardRoute(role as UserRole);

        return {
            ...response,
            result: {
                ...response.result,
                redirectTo: targetPath,
            },
        } as ApiResponse<ILoginResponse>;

    } catch (error: any) {
        return {
            success: false,
            message: extractLoginErrorMessage(error)
        }
    }
}