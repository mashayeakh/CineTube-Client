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

    const reviewedMovieIds = new Set(
        items
            .map((item) => {
                const reviewRecord = item as Record<string, unknown>;
                const movieRecord = isRecord(reviewRecord.movie)
                    ? (reviewRecord.movie as Record<string, unknown>)
                    : null;

                return parseString(
                    movieRecord?.movieId ??
                    movieRecord?._id ??
                    movieRecord?.id ??
                    reviewRecord.movieId ??
                    findValue(item, ["movieId", "filmId"]),
                    ""
                );
            })
            .filter((movieId) => movieId.length > 0)
    );

    const watchlistItems = extractArray(watchlistPayload, ["watchlist", "items", "movies", "results", "data"]);
    const watchlistMovies = watchlistItems.map((item) => {
        const record = item as Record<string, unknown>;
        const movieId = parseString(record.movieId ?? findValue(item, ["movieId"]), "");
        const movieObj = record.movie as Record<string, unknown> | undefined;
        const title = parseString(
            movieObj?.title ?? findValue(item, ["title", "movieTitle", "name"]),
            "Unknown Movie"
        );
        return { movieId, title };
    }).filter((m) => m.movieId.length > 0 && !reviewedMovieIds.has(m.movieId));

    const parseReactionCount = (value: unknown) => {
        if (Array.isArray(value)) {
            return value.length;
        }

        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }

        if (typeof value === "string") {
            const numeric = Number(value);
            return Number.isFinite(numeric) ? numeric : 0;
        }

        if (isRecord(value)) {
            const directCandidates = [
                value.count,
                value.total,
                value.length,
                value.likesCount,
                value.likeCount,
                value.dislikesCount,
                value.dislikeCount,
            ];

            for (const candidate of directCandidates) {
                if (typeof candidate === "number" && Number.isFinite(candidate)) {
                    return candidate;
                }

                if (typeof candidate === "string") {
                    const numeric = Number(candidate);
                    if (Number.isFinite(numeric)) {
                        return numeric;
                    }
                }
            }

            for (const candidate of Object.values(value)) {
                if (Array.isArray(candidate)) {
                    return candidate.length;
                }
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
        const likesValue = findValue(item, ["likesCount", "likeCount", "totalLikes", "likes", "likedBy", "reviewLikes", "upvotes", "upvoteCount"]);
        const dislikesValue = findValue(item, ["dislikesCount", "dislikeCount", "totalDislikes", "dislikes", "dislikedBy", "reviewDislikes", "downvotes", "downvoteCount"]);
        const reactionsValue = findValue(item, ["reactions", "reviewReactions", "reaction"]);

        let likesCount = parseReactionCount(likesValue);
        let dislikesCount = parseReactionCount(dislikesValue);

        if (Array.isArray(reactionsValue)) {
            const likeFromReactions = reactionsValue.filter((entry) => {
                if (!isRecord(entry)) {
                    return false;
                }

                const type = parseString(entry.type ?? entry.reactionType ?? entry.action, "").toUpperCase();
                return type === "LIKE" || type === "UPVOTE";
            }).length;

            const dislikeFromReactions = reactionsValue.filter((entry) => {
                if (!isRecord(entry)) {
                    return false;
                }

                const type = parseString(entry.type ?? entry.reactionType ?? entry.action, "").toUpperCase();
                return type === "DISLIKE" || type === "DOWNVOTE";
            }).length;

            likesCount = Math.max(likesCount, likeFromReactions);
            dislikesCount = Math.max(dislikesCount, dislikeFromReactions);
        }

        const reactions = `${likesCount}/${dislikesCount}`;

        return [content, rating, spoiler, status, reactions, createdAt];
    });

    const pendingCount = items.filter((item) => {
        const status = parseString(findValue(item, ["status", "state"]), "").toUpperCase();
        return status.includes("PENDING");
    }).length;

    return (
        <UserPageShell
            activePath="/user/reviews"
            title="My Reviews"
        // subtitle="Data from GET /api/v1/user/dashboard/reviews"
        >
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Write a Review</h2>
                <ReviewFormClient watchlistMovies={watchlistMovies} />
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                {pendingCount > 0 ? (
                    <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                        Your review is under pending. Please wait for admin approval.
                    </p>
                ) : null}

                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">Total reviews</p>
                    <p className="text-lg font-semibold text-slate-900">{items.length}</p>
                </div>

                <UserDataTable
                    headers={["Content", "Rating", "Spoiler", "Status", "Likes", "Created"]}
                    rows={rows}
                    emptyMessage="No reviews found."
                />
            </section>
        </UserPageShell>
    );
}
