import { UserDataTable } from "@/components/user/user-data-table";
import { UserPageShell } from "@/components/user/user-page-shell";
import { unstable_noStore as noStore } from "next/cache";
import {
    extractArray,
    findValue,
    formatDate,
    isRecord,
    parseString,
} from "@/lib/user-dashboard.utils";
import { getUserDashboardReviews } from "@/service/user-dashboard.services";
import { getMyWatchlists } from "@/service/watchlist.services";
import ReviewFormClient from "./ReviewFormClient";

export default async function UserReviewsPage() {
    noStore();

    let payload: unknown = null;
    let watchlistPayload: unknown = null;

    try {
        const [reviewRes, watchlistRes] = await Promise.all([
            getUserDashboardReviews(),
            getMyWatchlists(),
        ]);
        payload = reviewRes.data;
        watchlistPayload = watchlistRes.data;
    } catch {
        payload = null;
        watchlistPayload = null;
    }

    const items = extractArray(payload, ["reviews", "items", "results", "data"]);

    // ✅ Track reviewed IDs (movie + series)
    const reviewedIds = new Set(
        items
            .map((item) => {
                const record = item as Record<string, unknown>;

                const movieId = parseString(
                    record.movieId ??
                    findValue(item, ["movieId"]),
                    ""
                );

                const seriesId = parseString(
                    record.seriesId ??
                    findValue(item, ["seriesId"]),
                    ""
                );

                return movieId || seriesId;
            })
            .filter((id) => id.length > 0)
    );

    // ✅ FIXED WATCHLIST MAPPING (MOVIE + SERIES)
    const watchlistItems = extractArray(watchlistPayload, [
        "watchlist",
        "items",
        "movies",
        "results",
        "data",
    ]);

    const watchlistMovies = watchlistItems
        .map((item) => {
            const record = item as Record<string, unknown>;

            const movieObj = record.movie as Record<string, unknown> | undefined;
            const seriesObj = record.series as Record<string, unknown> | undefined;

            // MOVIE
            if (movieObj) {
                const id = parseString(movieObj.id ?? record.movieId, "");
                const title = parseString(
                    movieObj.title ?? findValue(movieObj, ["title", "name"]),
                    "Unknown Movie"
                );

                return {
                    id,
                    title,
                    type: "MOVIE" as const,
                };
            }

            // SERIES
            if (seriesObj) {
                const id = parseString(seriesObj.id ?? record.seriesId, "");
                const title = parseString(
                    seriesObj.title ?? findValue(seriesObj, ["title", "name"]),
                    "Unknown Series"
                );

                return {
                    id,
                    title,
                    type: "SERIES" as const,
                };
            }

            return null;
        })
        .filter(
            (item): item is { id: string; title: string; type: "MOVIE" | "SERIES" } =>
                !!item &&
                item.id.length > 0 &&
                !reviewedIds.has(item.id) // ✅ prevent already reviewed
        );

    // ✅ Reaction count helper
    const parseReactionCount = (value: unknown) => {
        if (Array.isArray(value)) return value.length;

        if (typeof value === "number" && Number.isFinite(value)) return value;

        if (typeof value === "string") {
            const num = Number(value);
            return Number.isFinite(num) ? num : 0;
        }

        if (isRecord(value)) {
            const candidates = [
                value.count,
                value.total,
                value.length,
                value.likesCount,
                value.likeCount,
                value.dislikesCount,
                value.dislikeCount,
            ];

            for (const c of candidates) {
                if (typeof c === "number" && Number.isFinite(c)) return c;
                if (typeof c === "string") {
                    const num = Number(c);
                    if (Number.isFinite(num)) return num;
                }
            }

            for (const v of Object.values(value)) {
                if (Array.isArray(v)) return v.length;
            }
        }

        return 0;
    };

    const rows = items.slice(0, 20).map((item) => {
        const content = parseString(findValue(item, ["content", "review", "description"]));
        const rating = parseString(findValue(item, ["rating", "stars"]));
        const spoiler = parseString(findValue(item, ["spoiler", "isSpoiler"]));
        const status = parseString(findValue(item, ["status"]));
        const createdAt = formatDate(findValue(item, ["createdAt", "date"]));

        const likesValue = findValue(item, [
            "likesCount",
            "likeCount",
            "totalLikes",
            "likes",
            "reviewLikes",
        ]);

        const dislikesValue = findValue(item, [
            "dislikesCount",
            "dislikeCount",
            "totalDislikes",
            "dislikes",
        ]);

        const reactions = `${parseReactionCount(likesValue)}/${parseReactionCount(dislikesValue)}`;

        return [content, rating, spoiler, status, reactions, createdAt];
    });

    const pendingCount = items.filter((item) => {
        const status = parseString(findValue(item, ["status"]), "").toUpperCase();
        return status.includes("PENDING");
    }).length;

    return (
        <UserPageShell activePath="/user/reviews" title="My Reviews">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                    Write a Review
                </h2>

                {/* ✅ FIXED */}
                <ReviewFormClient watchlistMovies={watchlistMovies} />
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                {pendingCount > 0 && (
                    <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                        Your review is under pending. Please wait for admin approval.
                    </p>
                )}

                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">Total reviews</p>
                    <p className="text-lg font-semibold text-slate-900">
                        {items.length}
                    </p>
                </div>

                <UserDataTable
                    headers={[
                        "Content",
                        "Rating",
                        "Spoiler",
                        "Status",
                        "Likes",
                        "Created",
                    ]}
                    rows={rows}
                    emptyMessage="No reviews found."
                />
            </section>
        </UserPageShell>
    );
}