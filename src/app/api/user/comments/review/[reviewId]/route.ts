import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const COMMENT_LIST_PATHS = [
    (reviewId: string) => `/comments/review/${reviewId}`,
    (reviewId: string) => `/comments/${reviewId}`,
    (reviewId: string) => `/user/comments/${reviewId}`,
];

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

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    const auth = await getAuthorizedContext();

    if (!auth) {
        return NextResponse.json({ message: "Please log in to view comments." }, { status: 401 });
    }

    const routeParams = await params;
    const reviewId = normalizeRouteId(routeParams.reviewId);

    if (!reviewId) {
        return NextResponse.json({ message: "Review ID is required." }, { status: 400 });
    }

    let lastStatus = 500;
    let lastMessage = "Unable to load comments.";

    for (const buildPath of COMMENT_LIST_PATHS) {
        const response = await fetch(`${BASE_API_URL}${buildPath(reviewId)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.accessToken}`,
                Cookie: auth.cookieHeader,
            },
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

    return NextResponse.json({ message: lastMessage }, { status: lastStatus });
}
