/* eslint-disable @typescript-eslint/no-unused-vars */
"use server"

import jwt, { JwtPayload } from "jsonwebtoken"
import { setCookie } from "./cookies.utils";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_TOKEN

export const getTokenSecondRemaining = async (token: string): Promise<number> => {
    if (!token) return 0;

    try {
        const tokenPayload = JWT_ACCESS_SECRET ? jwt.verify(token, JWT_ACCESS_SECRET as string) as JwtPayload : jwt.decode(token) as JwtPayload;

        if (tokenPayload && !tokenPayload.exp) {
            return 0;
        }

        const remainingSeconds = tokenPayload.exp as number - Math.floor(Date.now() / 1000)

        return remainingSeconds > 0 ? remainingSeconds : 0;

    } catch (error) {
        return 0;
    }
}

export const setTokenInCookie = async (
    name: string,
    token: string,
    fallbackMaxAgeInSeconds: number = 24 * 60 * 60
) => {
    const maxAgeInSeconds = await getTokenSecondRemaining(token);
    await setCookie(name, token, maxAgeInSeconds || fallbackMaxAgeInSeconds)
}