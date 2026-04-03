import { NextResponse } from "next/server";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

type UnknownRecord = Record<string, unknown>;

type OptionItem = {
    id: string;
    name: string;
};

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickString(source: unknown, keys: string[], fallback = "") {
    if (!isRecord(source)) {
        return fallback;
    }

    for (const key of keys) {
        const value = source[key];

        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    return fallback;
}

function normalizeOptions(raw: unknown, typePrefix: "genre" | "platform"): OptionItem[] {
    const list = Array.isArray(raw)
        ? raw
        : isRecord(raw) && Array.isArray(raw.result)
            ? (raw.result as unknown[])
            : isRecord(raw) && Array.isArray(raw.data)
                ? (raw.data as unknown[])
                : isRecord(raw) && Array.isArray(raw.items)
                    ? (raw.items as unknown[])
                    : [];

    return list
        .map((item, index) => ({
            id: pickString(item, ["_id", "id", `${typePrefix}Id`], `${typePrefix}-${index + 1}`),
            name: pickString(item, ["name", "title"], `${typePrefix} ${index + 1}`),
        }))
        .filter((item) => Boolean(item.id && item.name));
}

async function tryFetchFromEndpoints(endpoints: string[]) {
    if (!BASE_API_URL) {
        return [];
    }

    for (const endpoint of endpoints) {
        const url = `${BASE_API_URL}${endpoint}`;

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

            return await response.json();
        } catch {
            // try next endpoint candidate
        }
    }

    return [];
}

export async function GET() {
    if (!BASE_API_URL) {
        return NextResponse.json({ message: "API base URL is missing." }, { status: 500 });
    }

    const [genresRaw, platformsRaw] = await Promise.all([
        tryFetchFromEndpoints(["/genres", "/api/v1/genres"]),
        tryFetchFromEndpoints([
            "/streaming-platforms",
            "/platforms",
            "/api/v1/streaming-platforms",
            "/api/v1/platforms",
        ]),
    ]);

    const genres = normalizeOptions(genresRaw, "genre");
    const platforms = normalizeOptions(platformsRaw, "platform");

    return NextResponse.json({
        genres,
        platforms,
    });
}
