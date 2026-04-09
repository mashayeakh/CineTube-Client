import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Home, Search } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ReviewTableClient } from "@/components/admin/review-table-client";
import { resolveMediaUrl } from "@/lib/media";
import { approveReview, getAdminReviews, rejectReview } from "@/service/admin-review.services";

type UnknownRecord = Record<string, unknown>;

type ReviewRow = {
    id: string;
    movieTitle: string;
    moviePoster: string;
    reviewerName: string;
    reviewerEmail: string;
    rating: number;
    content: string;
    status: string;
    createdAt: string;
    details: UnknownRecord;
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

function pickNumber(source: unknown, keys: string[], fallback = 0) {
    if (!isRecord(source)) {
        return fallback;
    }

    for (const key of keys) {
        const value = source[key];
        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }
    }

    return fallback;
}

function extractArray(source: unknown, keys: string[]) {
    if (Array.isArray(source)) {
        return source;
    }

    if (isRecord(source)) {
        for (const key of keys) {
            if (Array.isArray(source[key])) {
                return source[key] as unknown[];
            }
        }

        for (const value of Object.values(source)) {
            if (Array.isArray(value)) {
                return value;
            }
        }
    }

    return [] as unknown[];
}

function normalizeSeriesLikeReviews(raw: unknown): ReviewRow[] {
    const list = extractArray(raw, ["reviews", "items", "result", "data", "rows", "records"]);

    return list
        .map((item, index) => {
            const seriesObject = isRecord(item) ? (item.series ?? item.show ?? item.content ?? null) : null;
            const movieObject = isRecord(item) ? (item.movie ?? null) : null;
            const userObject = isRecord(item) ? (item.user ?? item.reviewer ?? item.createdBy) : null;

            return {
                id: pickString(item, ["id", "_id", "reviewId"], `review-${index + 1}`),
                movieTitle: pickString(
                    seriesObject,
                    ["title", "name"],
                    pickString(movieObject, ["title", "name"], pickString(item, ["seriesTitle", "movieTitle", "title"], "Unknown title"))
                ),
                moviePoster: resolveMediaUrl(
                    pickString(
                        seriesObject,
                        ["poster", "thumbnail", "image", "coverImage", "banner"],
                        pickString(movieObject, ["poster", "thumbnail", "image"], pickString(item, ["poster", "moviePoster", "image"], ""))
                    )
                ),
                reviewerName: pickString(
                    userObject,
                    ["name", "fullName", "username"],
                    pickString(item, ["reviewerName", "userName", "author"], "Unknown user")
                ),
                reviewerEmail: pickString(userObject, ["email"], pickString(item, ["reviewerEmail", "email"], "N/A")),
                rating: pickNumber(item, ["rating", "stars", "score"], 0),
                content: pickString(item, ["content", "review", "message", "text"], ""),
                status: pickString(item, ["status", "state"], "PENDING").toUpperCase(),
                createdAt: pickString(item, ["createdAt", "submittedAt", "date"], ""),
                details: isRecord(item) ? item : {},
            };
        })
        .filter((item) => Boolean(item.id));
}

async function approveReviewAction(formData: FormData) {
    "use server";

    const reviewId = String(formData.get("reviewId") ?? "");

    if (!reviewId) {
        return;
    }

    try {
        await approveReview(reviewId);
    } catch (error) {
        console.error("Failed to approve review:", error);
    }

    revalidatePath("/admin/series-management/reviews");
}

async function rejectReviewAction(formData: FormData) {
    "use server";

    const reviewId = String(formData.get("reviewId") ?? "");

    if (!reviewId) {
        return;
    }

    try {
        await rejectReview(reviewId);
    } catch (error) {
        console.error("Failed to reject review:", error);
    }

    revalidatePath("/admin/series-management/reviews");
}

export default async function AdminSeriesReviewsPage() {
    const rawReviews = await getAdminReviews().catch(() => []);
    const reviews = normalizeSeriesLikeReviews(rawReviews);

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/series-management/reviews" />

                <div className="min-w-0">
                    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Series Management</p>
                            <p className="text-xs text-slate-500">Reviews</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500 md:flex">
                                <Search className="size-4" />
                                Search
                            </div>
                            <Link href="/admin/dashboard" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-700">
                                <Home className="size-4" />
                            </Link>
                        </div>
                    </header>

                    <main className="p-4 sm:p-6">
                        <div className="mx-auto max-w-7xl space-y-5">
                            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-sm text-slate-500">Admin / Series Management / Reviews</p>
                                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Review Handler</h1>
                                <p className="mt-2 text-sm text-slate-600">Moderate submitted reviews, then approve or reject each review.</p>
                            </section>

                            <ReviewTableClient
                                reviews={reviews}
                                approveReviewAction={approveReviewAction}
                                rejectReviewAction={rejectReviewAction}
                            />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
