// USER
// ADMIN
// PREMIUM_USER


export type UserRole = "USER" | "ADMIN" | "PREMIUM_USER";

export const authRoutes = ["/login", "/signup", "/forgetPassword", "/reset-password", "/verify-email"]

export function isAuthRoute(pathname: string) {
    return authRoutes.some((route: string) => route === pathname);
}

export type RouteConfig = {
    exact: string[],
    pattern: RegExp[] // partial
}

export const commonProtectedRoutes: RouteConfig = {
    exact: ["/my-profile", "/change-password"],
    pattern: []
}


export const userProtectedRoutes: RouteConfig = {
    pattern: [/^\/user\/dashboard(?:\/|$)/],
    exact: ["/payment/success"]
};


export const premiumUserProtectedRoutes: RouteConfig = {
    pattern: [/^\/premium_user\/dashboard(?:\/|$)/],
    exact: []
};

export const adminProtectedRoutes: RouteConfig = {
    pattern: [/^\/admin(?:\/|$)/],
    exact: []
}

export const isRouteMatches = (pathname: string, routes: RouteConfig) => {
    if (routes.exact.includes(pathname)) {
        return true;
    }

    return routes.pattern.some((pattern: RegExp) => pattern.test(pathname));
}

export const getRouteOwner = (pathname: string): "USER" | "ADMIN" | "PREMIUM_USER" | null => {
    if (isRouteMatches(pathname, adminProtectedRoutes)) {
        return "ADMIN";
    }
    if (isRouteMatches(pathname, premiumUserProtectedRoutes)) {
        return "PREMIUM_USER";
    }
    if (isRouteMatches(pathname, userProtectedRoutes)) {
        return "USER";
    }
    // if (isRouteMatches(pathname, commonProtectedRoutes)) {
    //     return "COMMON";
    // }

    return null;
}

export const getDefaultDashboardRoute = (role: UserRole) => {
    switch (role) {
        case "ADMIN":
            return "/admin/dashboard";
        case "PREMIUM_USER":
            return "/premium_user/dashboard";
        case "USER":
            return "/user/dashboard";
        default:
            return "/";
    }
};