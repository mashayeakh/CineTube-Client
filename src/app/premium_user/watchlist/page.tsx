import { PremiumPageShell } from "@/components/premium/premium-page-shell";
import { UserDataTable } from "@/components/user/user-data-table";
import {
    extractArray,
    findValue,
    formatDate,
    parseString,
} from "@/lib/user-dashboard.utils";
import { getMyWatchlists } from "@/service/watchlist.services";

export default async function PremiumWatchlistPage() {
    let payload: unknown = null;

    try {
        const response = await getMyWatchlists();
        payload = response.data;
    } catch {
        payload = null;
    }

    const items = extractArray(payload, ["watchlist", "items", "movies", "results", "data"]);

    const rows = items.slice(0, 20).map((item) => {
        const movieObject = findValue(item, ["movie"]) as Record<string, unknown> | undefined;
        const title = parseString(findValue(movieObject ?? item, ["title", "movieTitle", "name"]));
        const genre = parseString(findValue(movieObject ?? item, ["genre", "category"]));
        const year = parseString(findValue(movieObject ?? item, ["releaseYear", "year"]));
        const addedAt = formatDate(findValue(item, ["addedAt", "createdAt", "date"]));
        const status = parseString(findValue(item, ["status"]));

        return [title, genre, year, addedAt, status];
    });

    return (
        <PremiumPageShell
            activePath="/premium_user/watchlist"
            title="My Watchlist"
        // subtitle="Data from GET /api/v1/watchlists"
        >
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">Total items</p>
                    <p className="text-lg font-semibold text-slate-900">{items.length}</p>
                </div>

                <UserDataTable
                    headers={["Title", "Genre", "Year", "Added", "Status"]}
                    rows={rows}
                    emptyMessage="No watchlist items found."
                />
            </section>
        </PremiumPageShell>
    );
}