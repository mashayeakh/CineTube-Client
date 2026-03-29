import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    const cookieStore = await cookies();

    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    // Best effort: notify backend to invalidate session.
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (baseUrl) {
            const forwardedCookies = [
                accessToken ? `accessToken=${accessToken}` : null,
                refreshToken ? `refreshToken=${refreshToken}` : null,
                sessionToken ? `better-auth.session_token=${sessionToken}` : null,
            ]
                .filter(Boolean)
                .join("; ");

            await fetch(`${baseUrl}/auth/user/logout`, {
                method: "POST",
                headers: forwardedCookies ? { Cookie: forwardedCookies } : {},
                cache: "no-store",
            });
        }
    } catch {
        // Continue cookie cleanup even if backend call fails.
    }

    const response = NextResponse.json({ success: true });

    // Delete cookies with the same shape used when setting them.
    response.cookies.set("accessToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        expires: new Date(0),
    });

    response.cookies.set("refreshToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        expires: new Date(0),
    });

    response.cookies.set("better-auth.session_token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        expires: new Date(0),
    });

    return response;
}
