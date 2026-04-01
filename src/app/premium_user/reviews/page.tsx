import { PremiumPageShell } from "@/components/premium/premium-page-shell";
import { UserDataTable } from "@/components/user/user-data-table";
import {
    extractArray,
    findValue,
    formatDate,
    parseString,
} from "@/lib/user-dashboard.utils";
import { getUserDashboardReviews } from "@/service/user-dashboard.services";
import { getMyWatchlists } from "@/service/watchlist.services";
import ReviewFormClient from "@/app/user/reviews/ReviewFormClient";

export default async function PremiumReviewsPage() {
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
    }).filter((m) => m.movieId.length > 0);

    const rows = items.slice(0, 20).map((item) => {
        const content = parseString(findValue(item, ["content", "review", "description"]));
        const rating = parseString(findValue(item, ["rating", "stars"]));
        const spoiler = parseString(findValue(item, ["spoiler", "isSpoiler"]));
        const status = parseString(findValue(item, ["status"]));
        const createdAt = formatDate(findValue(item, ["createdAt", "date"]));

        return [content, rating, spoiler, status, createdAt];
    });

    return (
        <PremiumPageShell
            activePath="/premium_user/reviews"
            title="My Reviews"
        // subtitle="Data from GET /api/v1/user/dashboard/reviews"
        >
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Write a Review</h2>
                <ReviewFormClient watchlistMovies={watchlistMovies} />
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">Total reviews</p>
                    <p className="text-lg font-semibold text-slate-900">{items.length}</p>
                </div>

                <UserDataTable
                    headers={["Content", "Rating", "Spoiler", "Status", "Created"]}
                    rows={rows}
                    emptyMessage="No reviews found."
                />
            </section>
        </PremiumPageShell>
    );
}