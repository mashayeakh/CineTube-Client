import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

type AuthorizedContext = {
    accessToken: string;
    cookieHeader: string;
};

async function buildCookieHeader() {
    const cookieStore = await cookies();

    return cookieStore
        .getAll()
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");
}

async function getAuthorizedContext(): Promise<AuthorizedContext | null> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const cookieHeader = await buildCookieHeader();

    if (!accessToken || !BASE_API_URL) {
        return null;
    }

    return {
        accessToken,
        cookieHeader,
    };
}

async function tryFetchRecommendations(auth: AuthorizedContext) {
    const endpoints = [
        "/user-preferences/recommendations",
        "/api/v1/user-preferences/recommendations",
        "/api/v1/user-preferences/user-preferences/recommendations",
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`${BASE_API_URL}${endpoint}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.accessToken}`,
                    Cookie: auth.cookieHeader,
                },
                cache: "no-store",
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                continue;
            }

            return { ok: true, status: response.status, data };
        } catch {
            // try next endpoint candidate
        }
    }

    return { ok: false, status: 400, data: { message: "Failed to fetch recommendations." } };
}

export async function GET() {
    const auth = await getAuthorizedContext();

    if (!auth) {
        return NextResponse.json({ message: "Please log in first." }, { status: 401 });
    }

    const result = await tryFetchRecommendations(auth);

    if (!result.ok) {
        return NextResponse.json(result.data, { status: result.status });
    }

    return NextResponse.json(result.data, { status: result.status });
}
