import { NextResponse } from "next/server";

type UnknownRecord = Record<string, unknown>;

const CANDIDATE_PATHS = ["/leaderboard", "/api/v1/leaderboard"];

function getBaseCandidates() {
    const envBase =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        process.env.NEXT_PUBLIC_API_URL;

    const bases = [
        envBase,
        "http://localhost:5000/api/v1",
        "http://localhost:5000",
    ]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.replace(/\/$/, ""));

    return Array.from(new Set(bases));
}

export async function GET() {
    const bases = getBaseCandidates();

    for (const base of bases) {
        for (const path of CANDIDATE_PATHS) {
            const url = `${base}${path}`;

            try {
                const response = await fetch(url, {
                    method: "GET",
                    cache: "no-store",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    continue;
                }

                const payload = (await response.json()) as UnknownRecord;
                return NextResponse.json(payload, { status: 200 });
            } catch {
                continue;
            }
        }
    }

    return NextResponse.json(
        {
            success: false,
            message: "Unable to fetch leaderboard from backend.",
            result: [],
        },
        { status: 502 }
    );
}
