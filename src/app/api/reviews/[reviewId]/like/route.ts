import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function buildCookieHeader() {
    return cookies().then((cookieStore) =>
        cookieStore
            .getAll()
            .map((cookie) => `${cookie.name}=${cookie.value}`)
            .join("; ")
    );
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

async function proxyReviewLike(
    reviewId: string,
    method: "POST" | "DELETE",
    auth: NonNullable<Awaited<ReturnType<typeof getAuthorizedContext>>>
) {
    const response = await fetch(`${BASE_API_URL}/review-like/${reviewId}/like`, {
        method,
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
            { message: (payload as { message?: string }).message ?? "Unable to update review like." },
            { status: response.status }
        );
    }

    return NextResponse.json(payload, { status: response.status });
}

function getReviewId(params: { reviewId?: string }) {
    return typeof params.reviewId === "string" ? params.reviewId.trim() : "";
}

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    const auth = await getAuthorizedContext();

    if (!auth) {
        return NextResponse.json({ message: "Please log in to like reviews." }, { status: 401 });
    }

    const routeParams = await params;
    const reviewId = getReviewId(routeParams);

    if (!reviewId) {
        return NextResponse.json({ message: "Review ID is required." }, { status: 400 });
    }

    return proxyReviewLike(reviewId, "POST", auth);
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    const auth = await getAuthorizedContext();

    if (!auth) {
        return NextResponse.json({ message: "Please log in to update review reactions." }, { status: 401 });
    }

    const routeParams = await params;
    const reviewId = getReviewId(routeParams);

    if (!reviewId) {
        return NextResponse.json({ message: "Review ID is required." }, { status: 400 });
    }

    return proxyReviewLike(reviewId, "DELETE", auth);
}
