import { UserDataTable } from "@/components/user/user-data-table";
import { UserPageShell } from "@/components/user/user-page-shell";
import {
    extractArray,
    findValue,
    formatDate,
    parseString,
} from "@/lib/user-dashboard.utils";
import { getMyWatchlists, getMySeriesWatchlists } from "@/service/watchlist.services";

export default async function UserWatchlistPage() {
    let moviePayload: unknown = null;
    let seriesPayload: unknown = null;

    try {
        const [movieResponse, seriesResponse] = await Promise.all([
            getMyWatchlists(),
            getMySeriesWatchlists(),
        ]);
        moviePayload = movieResponse.data;
        seriesPayload = seriesResponse.data;
    } catch {
        moviePayload = null;
        seriesPayload = null;
    }

    // ── movie items ───────────────────────────────────────────────────────────
    const movieItems = extractArray(moviePayload, ["watchlist", "items", "movies", "results", "data"]);

    const movieRows = movieItems.map((item) => {
        const movieObject = findValue(item, ["movie"]) as Record<string, unknown> | undefined;
        const title = parseString(findValue(movieObject ?? item, ["title", "movieTitle", "name"]));
        const genre = parseString(findValue(movieObject ?? item, ["genre", "genres", "category"]));
        const year = parseString(findValue(movieObject ?? item, ["releaseYear", "year"]));
        const addedAt = formatDate(findValue(item, ["addedAt", "createdAt", "date"]));
        const status = parseString(findValue(item, ["status"]));

        return [title || "—", genre || "—", year || "—", addedAt, status || "—"];
    });

    // ── series items ──────────────────────────────────────────────────────────
    const seriesItems = extractArray(seriesPayload, ["watchlist", "items", "series", "results", "data"]);

    const seriesRows = seriesItems.map((item) => {
        const seriesObject = findValue(item, ["series", "tvShow", "show"]) as Record<string, unknown> | undefined;
        const title = parseString(findValue(seriesObject ?? item, ["title", "name", "seriesTitle"]));
        const genre = parseString(findValue(seriesObject ?? item, ["genre", "genres", "category"]));
        const year = parseString(findValue(seriesObject ?? item, ["releaseYear", "year"]));
        const addedAt = formatDate(findValue(item, ["addedAt", "createdAt", "date"]));
        // const status = parseString(findValue(item, ["status"]));

        return [title || "—", genre || "—", year || "—", addedAt];
    });

    // ── merge both ────────────────────────────────────────────────────────────
    const allRows = [...movieRows, ...seriesRows].slice(0, 20);
    const totalItems = movieItems.length + seriesItems.length;

    return (
        <UserPageShell
            activePath="/user/watchlist"
            title="My Watchlist"
        >
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">Total items</p>
                    <p className="text-lg font-semibold text-slate-900">{totalItems}</p>
                </div>

                <UserDataTable
                    headers={["Title", "Genre", "Year", "Added", "Status"]}
                    rows={allRows}
                    emptyMessage="No watchlist items found."
                />
            </section>
        </UserPageShell>
    );
}