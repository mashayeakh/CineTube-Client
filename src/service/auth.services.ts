"use server"

import { setTokenInCookie } from "@/lib/token.utils";
import { cookies } from "next/headers";

const BASE_API_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL;

export async function getNewTokensWithRefreshToken(refreshToken: string): Promise<boolean> {

    if (!BASE_API_URL) {
        return false;
    }

    try {
        const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `refreshToken=${refreshToken}`
            }
        });

        if (!res.ok) {
            return false;
        }

        const { data } = await res.json();

        const { accessToken, refreshToken: newRefreshToken, token } = data;

        if (accessToken) {
            await setTokenInCookie("accessToken", accessToken);
        }

        if (newRefreshToken) {
            await setTokenInCookie("refreshToken", newRefreshToken);
        }

        if (token) {
            await setTokenInCookie("better-auth.session_token", token, 24 * 60 * 60); // 1 day in seconds
        }

        return true;
    } catch (error) {
        console.error("Error refreshing token:", error);
        return false;
    }
}


export async function getUserInfo() {
    if (!BASE_API_URL) {
        return null;
    }

    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;
        const sessionToken = cookieStore.get("better-auth.session_token")?.value;

        if (!accessToken) {
            return null;
        }

        const res = await fetch(`${BASE_API_URL}/auth/user/profile`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`
            }
        });

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                return null;
            }

            console.error("Failed to fetch user info:", res.status, res.statusText);
            return null;
        }

        const payload = await res.json() as { data?: unknown; result?: unknown };

        return (payload.data ?? payload.result ?? null) as Record<string, unknown> | null;
    } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
    }
}