import { NextRequest, NextResponse } from "next/server";
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, UserRole } from "@/lib/authUtils";

const ROLE_ROUTES = ["USER", "ADMIN", "PREMIUM_USER"] as const;

function decodeRoleFromAccessToken(token?: string): UserRole | null {
    if (!token) return null;

    try {
        const parts = token.split(".");
        if (parts.length < 2) return null;

        const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = payloadBase64 + "=".repeat((4 - (payloadBase64.length % 4)) % 4);
        const payload = JSON.parse(atob(padded)) as { role?: unknown };

        if (payload.role === "USER" || payload.role === "ADMIN" || payload.role === "PREMIUM_USER") {
            return payload.role;
        }

        return null;
    } catch {
        return null;
    }
}

function redirectToLogin(request: NextRequest, pathWithQuery: string) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathWithQuery);
    return NextResponse.redirect(loginUrl);
}

function stampAuthCookie(response: NextResponse, userRole: UserRole | null) {
    if (userRole) {
        response.cookies.set("_auth", userRole, {
            httpOnly: false,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24,
        });
        return response;
    }

    response.cookies.set("_auth", "", {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
    return response;
}

export default async function proxy(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl;
        const pathWithQuery = `${pathname}${request.nextUrl.search}`;
        const accessToken = request.cookies.get("accessToken")?.value;
        const userRole = decodeRoleFromAccessToken(accessToken);
        const isLoggedIn = Boolean(accessToken && userRole);

        const routeOwner = getRouteOwner(pathname);
        const isAuth = isAuthRoute(pathname);

        if (
            isAuth &&
            isLoggedIn &&
            pathname !== "/verify-email" &&
            pathname !== "/reset-password"
        ) {
            return stampAuthCookie(
                NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url)),
                userRole
            );
        }

        if (routeOwner === null) {
            return stampAuthCookie(NextResponse.next(), userRole);
        }

        if (!isLoggedIn) {
            return redirectToLogin(request, pathWithQuery);
        }

        const isUserRouteForPremium = routeOwner === "USER" && userRole === "PREMIUM_USER";
        if (isUserRouteForPremium) {
            return stampAuthCookie(NextResponse.next(), userRole);
        }

        if (ROLE_ROUTES.includes(routeOwner as (typeof ROLE_ROUTES)[number]) && routeOwner !== userRole) {
            return stampAuthCookie(
                NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url)),
                userRole
            );
        }

        return stampAuthCookie(NextResponse.next(), userRole);
    } catch (error) {
        console.error("Error in proxy middleware:", error);

        const pathname = request.nextUrl.pathname;
        const protectedPrefix =
            pathname.startsWith("/user") ||
            pathname.startsWith("/admin") ||
            // pathname.startsWith("/premium_user") ||
            pathname === "/my-profile" ||
            pathname === "/change-password";

        if (protectedPrefix) {
            return redirectToLogin(request, `${request.nextUrl.pathname}${request.nextUrl.search}`);
        }

        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|api/).*)",
    ],
};