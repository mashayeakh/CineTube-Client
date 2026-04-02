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

export async function POST(request: NextRequest) {
    const auth = await getAuthorizedContext();

    if (!auth) {
        return NextResponse.json({ message: "Please log in to comment on reviews." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const reviewId = typeof body.reviewId === "string" ? body.reviewId.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const parentId = typeof body.parentId === "string" ? body.parentId.trim() : "";

    if (!reviewId) {
        return NextResponse.json({ message: "Review ID is required." }, { status: 400 });
    }

    if (!content) {
        return NextResponse.json({ message: "Comment content is required." }, { status: 400 });
    }

    const response = await fetch(`${BASE_API_URL}/user/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
            Cookie: auth.cookieHeader,
        },
        body: JSON.stringify({
            reviewId,
            content,
            ...(parentId ? { parentId } : {}),
        }),
        cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        return NextResponse.json(
            { message: (payload as { message?: string }).message ?? "Unable to create comment." },
            { status: response.status }
        );
    }

    return NextResponse.json(payload, { status: response.status });
}
