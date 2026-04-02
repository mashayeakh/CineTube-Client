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

function normalizeRouteId(value: string | undefined) {
    return typeof value === "string" ? value.trim() : "";
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ commentId: string; userId: string }> }
) {
    const auth = await getAuthorizedContext();

    if (!auth) {
        return NextResponse.json({ message: "Please log in to update comments." }, { status: 401 });
    }

    const routeParams = await params;
    const commentId = normalizeRouteId(routeParams.commentId);
    const userId = normalizeRouteId(routeParams.userId);

    if (!commentId || !userId) {
        return NextResponse.json({ message: "Comment ID and user ID are required." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const content = typeof body.content === "string" ? body.content.trim() : undefined;
    const isSpoiler = typeof body.isSpoiler === "boolean" ? body.isSpoiler : undefined;

    const payloadBody: Record<string, unknown> = {};

    if (typeof content === "string") {
        payloadBody.content = content;
    }

    if (typeof isSpoiler === "boolean") {
        payloadBody.isSpoiler = isSpoiler;
    }

    const response = await fetch(`${BASE_API_URL}/user/comments/${commentId}/${userId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
            Cookie: auth.cookieHeader,
        },
        body: JSON.stringify(payloadBody),
        cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        return NextResponse.json(
            { message: (payload as { message?: string }).message ?? "Unable to update comment." },
            { status: response.status }
        );
    }

    return NextResponse.json(payload, { status: response.status });
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ commentId: string; userId: string }> }
) {
    const auth = await getAuthorizedContext();

    if (!auth) {
        return NextResponse.json({ message: "Please log in to delete comments." }, { status: 401 });
    }

    const routeParams = await params;
    const commentId = normalizeRouteId(routeParams.commentId);
    const userId = normalizeRouteId(routeParams.userId);

    if (!commentId || !userId) {
        return NextResponse.json({ message: "Comment ID and user ID are required." }, { status: 400 });
    }

    const response = await fetch(`${BASE_API_URL}/user/comments/${commentId}/${userId}`, {
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
            { message: (payload as { message?: string }).message ?? "Unable to delete comment." },
            { status: response.status }
        );
    }

    return NextResponse.json(payload, { status: response.status });
}
