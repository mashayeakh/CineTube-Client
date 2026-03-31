import { UserDataTable } from "@/components/user/user-data-table";
import { UserPageShell } from "@/components/user/user-page-shell";
import {
    extractArray,
    findValue,
    formatDate,
    parseString,
} from "@/lib/user-dashboard.utils";
import { getMyWatchlists } from "@/service/watchlist.services";

export default async function UserWatchlistPage() {
    let payload: unknown = null;

    try {
        const response = await getMyWatchlists();
        payload = response.data;
    } catch {
        payload = null;
    }

    const items = extractArray(payload, ["watchlist", "items", "movies", "results", "data"]);

    const rows = items.slice(0, 20).map((item) => {
        const title = parseString(findValue(item, ["title", "movieTitle", "name"]));
        const genre = parseString(findValue(item, ["genre", "category"]));
        const year = parseString(findValue(item, ["releaseYear", "year"]));
        const addedAt = formatDate(findValue(item, ["addedAt", "createdAt", "date"]));
        const status = parseString(findValue(item, ["status"]));

        return [title, genre, year, addedAt, status];
    });

    return (
        <UserPageShell
            activePath="/user/watchlist"
            title="My Watchlist"
            subtitle="Data from GET /api/v1/watchlists"
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
        </UserPageShell>
    );
}
