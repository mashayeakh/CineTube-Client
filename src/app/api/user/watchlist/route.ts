import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function buildCookieHeader() {
    return cookies().then((cookieStore) => cookieStore
        .getAll()
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; "));
}

async function getAuthorizedContext() {
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

async function createWatchlist(movieId: string, auth: NonNullable<Awaited<ReturnType<typeof getAuthorizedContext>>>) {
    const response = await fetch(`${BASE_API_URL}/watchlists`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
            Cookie: auth.cookieHeader,
        },
        body: JSON.stringify({ movieId }),
        cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        return NextResponse.json(
            { message: (payload as { message?: string }).message ?? "Unable to create watchlist item." },
            { status: response.status }
        );
    }

    return NextResponse.json(payload, { status: response.status });
}

async function resolveWatchlistIdByMovieId(movieId: string, auth: NonNullable<Awaited<ReturnType<typeof getAuthorizedContext>>>) {
    const response = await fetch(`${BASE_API_URL}/watchlists`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
            Cookie: auth.cookieHeader,
        },
        cache: "no-store",
    });

    if (!response.ok) {
        return null;
    }

    const payload = await response.json().catch(() => ({})) as {
        result?: Array<{ id?: string; movieId?: string }>;
        data?: Array<{ id?: string; movieId?: string }>;
    };

    const list = Array.isArray(payload.result)
        ? payload.result
        : Array.isArray(payload.data)
            ? payload.data
            : [];

    const match = list.find((item) => item.movieId === movieId);
    return typeof match?.id === "string" ? match.id : null;
}

async function deleteWatchlist(watchlistId: string, auth: NonNullable<Awaited<ReturnType<typeof getAuthorizedContext>>>) {
    const response = await fetch(`${BASE_API_URL}/watchlists/${watchlistId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
            Cookie: auth.cookieHeader,
        },
        cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        return NextResponse.json(
            { message: (payload as { message?: string }).message ?? "Unable to remove watchlist item." },
            { status: response.status }
        );
    }

    return NextResponse.json(payload, { status: response.status });
}

export async function POST(request: NextRequest) {
    const auth = await getAuthorizedContext();

    if (!auth) {
        return NextResponse.json({ message: "Please log in to save movies." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const movieId = typeof body.movieId === "string" ? body.movieId.trim() : "";

    if (!movieId) {
        return NextResponse.json({ message: "Movie ID is required." }, { status: 400 });
    }

    return createWatchlist(movieId, auth);
}

export async function DELETE(request: NextRequest) {
    const auth = await getAuthorizedContext();

    if (!auth) {
        return NextResponse.json({ message: "Please log in to update watchlist." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const movieId = typeof body.movieId === "string" ? body.movieId.trim() : "";
    const watchlistIdFromBody = typeof body.watchlistId === "string" ? body.watchlistId.trim() : "";

    const watchlistId = watchlistIdFromBody || (movieId ? await resolveWatchlistIdByMovieId(movieId, auth) : null);

    if (!watchlistId) {
        return NextResponse.json({ message: "Watchlist item not found." }, { status: 404 });
    }

    return deleteWatchlist(watchlistId, auth);
}