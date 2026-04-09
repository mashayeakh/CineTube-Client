import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

function getBaseCandidates() {
    const envBase =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        process.env.NEXT_PUBLIC_API_URL;

    const localBases = ["http://localhost:5000/api/v1", "http://localhost:5000"];
    const preferredOrder = process.env.NODE_ENV === "development"
        ? [...localBases, envBase]
        : [envBase, ...localBases];

    const bases = preferredOrder
        .filter((value): value is string => Boolean(value))
        .map((value) => value.replace(/\/$/, ""));

    return Array.from(new Set(bases));
}

const COMMENT_CREATE_PATHS = ["/comments", "/comments/", "/user/comments"];

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

    if (!accessToken) {
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
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const parentId = typeof body.parentId === "string" ? body.parentId.trim() : "";
    const isSpoiler = typeof body.isSpoiler === "boolean" ? body.isSpoiler : false;

    if (!reviewId) {
        return NextResponse.json({ message: "Review ID is required." }, { status: 400 });
    }

    if (!content) {
        return NextResponse.json({ message: "Comment content is required." }, { status: 400 });
    }

    const bases = getBaseCandidates();
    if (bases.length === 0) {
        return NextResponse.json({ message: "Comment API base URL is not configured." }, { status: 500 });
    }

    let lastStatus = 500;
    let lastMessage = "Unable to create comment.";

    for (const base of bases) {
        for (const path of COMMENT_CREATE_PATHS) {
            const response = await fetch(`${base}${path}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.accessToken}`,
                    Cookie: auth.cookieHeader,
                },
                body: JSON.stringify({
                    reviewId,
                    userId,
                    content,
                    isSpoiler,
                    ...(parentId ? { parentId } : {}),
                }),
                cache: "no-store",
            });

            const payload = await response.json().catch(() => ({}));

            if (response.ok) {
                return NextResponse.json(payload, { status: response.status });
            }

            lastStatus = response.status;
            lastMessage = (payload as { message?: string }).message ?? lastMessage;

            if (response.status !== 404) {
                break;
            }
        }
    }

    return NextResponse.json({ message: lastMessage }, { status: lastStatus });
}
