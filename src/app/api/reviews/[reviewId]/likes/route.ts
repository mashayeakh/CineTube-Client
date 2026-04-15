import { NextRequest, NextResponse } from "next/server";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getReviewId(params: { reviewId?: string }) {
    return typeof params.reviewId === "string" ? params.reviewId.trim() : "";
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    const routeParams = await params;
    const reviewId = getReviewId(routeParams);

    if (!BASE_API_URL) {
        return NextResponse.json({ message: "API base URL not set." }, { status: 500 });
    }
    if (!reviewId) {
        return NextResponse.json({ message: "Review ID is required." }, { status: 400 });
    }

    const response = await fetch(`${BASE_API_URL}/review-like/${reviewId}/likes`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        return NextResponse.json(
            { message: (payload as { message?: string }).message ?? "Unable to fetch likes count." },
            { status: response.status }
        );
    }

    return NextResponse.json(payload, { status: response.status });
}
