

/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { success } from "zod";
import { getRouteOwner, UserRole } from "../authUtils";


//!verify token: stpes

export const vefiryToken = (token: string, secret: string) => {
    try {
        const decoded = jwt.verify(token, secret) as JwtPayload;
        console.log("***Decoded token with token and secret: ", decoded)

        return {
            success: true,
            data: decoded
        }

    } catch (error: any) {
        // throw error;
        return {
            success: false,
            message: error.message,
            error
        }
    }
}


//! decode Token stpes

export const decodedToken = (token: string) => {
    const decoded = jwt.decode(token) as JwtPayload;
    console.log("Decoded token only: ", decoded)
    return decoded;
}

export const isValidRedirectForRole = (redirectPath: string, role: UserRole) => {


    const sanitizedRedirectPath = redirectPath.split("?")[0] || redirectPath;
    const routeOwner = getRouteOwner(sanitizedRedirectPath);


    if (routeOwner === role) {
        return true;
    }

    return false;
}