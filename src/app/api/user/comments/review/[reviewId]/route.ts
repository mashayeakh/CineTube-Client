import { NextResponse } from "next/server";
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

    if (!accessToken) {
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
    const routeParams = await params;
    const reviewId = normalizeRouteId(routeParams.reviewId);

    if (!reviewId) {
        return NextResponse.json({ message: "Review ID is required." }, { status: 400 });
    }

    const bases = getBaseCandidates();
    if (bases.length === 0) {
        return NextResponse.json({ message: "Comment API base URL is not configured." }, { status: 500 });
    }

    let lastStatus = 500;
    let lastMessage = "Unable to load comments.";

    // First, try all bases WITH auth if available
    if (auth?.accessToken) {
        for (const base of bases) {
            for (const buildPath of COMMENT_LIST_PATHS) {
                const response = await fetch(`${base}${buildPath(reviewId)}`, {
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
        }
    }

    // Then retry without auth (comments should be publicly readable)
    for (const base of bases) {
        for (const buildPath of COMMENT_LIST_PATHS) {
            const response = await fetch(`${base}${buildPath(reviewId)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
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
    }

    return NextResponse.json({ message: lastMessage }, { status: lastStatus });
}
