/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserDataTable } from "@/components/user/user-data-table";
import { UserPageShell } from "@/components/user/user-page-shell";
import {
    extractArray,
    findValue,
    formatDate,
    parseString,
} from "@/lib/user-dashboard.utils";
import { getMyMoviesWatchlists, getMySeriesWatchlists } from "@/service/watchlist.services";

export default async function UserWatchlistPage() {
    let moviePayload: unknown = null;
    let seriesPayload: unknown = null;

    try {
        const [movieResponse, seriesResponse] = await Promise.all([
            getMyMoviesWatchlists(),
            getMySeriesWatchlists(),
        ]);
        moviePayload = movieResponse.data;
        seriesPayload = seriesResponse.data;
    } catch {
        moviePayload = null;
        seriesPayload = null;
    }


    console.log("movie palyload---", moviePayload)


    // ── movie items ───────────────────────────────────────────────────────────
    const movieItems = extractArray(moviePayload, ["watchlist", "items", "movies", "results", "data"]);

    const movieRows = movieItems.map((item) => {
        const movieObject = findValue(item, ["movie"]) as Record<string, unknown> | undefined;
        const title = parseString(findValue(movieObject ?? item, ["title", "movieTitle", "name"]));
        const genresArray = findValue(movieObject ?? item, ["genres"]) as unknown[];
        const genre = Array.isArray(genresArray)
            ? genresArray.map((g: any) => g.name || g).join(", ")
            : "—";

        const year = parseString(findValue(movieObject ?? item, ["releaseYear", "year"]));
        const addedAt = formatDate(findValue(item, ["addedAt", "createdAt", "date"]));
        // const status = parseString(findValue(item, ["status"]));

        return [title || "—", genre || "—", year || "—", addedAt];
    });

    // ── series items ──────────────────────────────────────────────────────────
    const seriesItems = extractArray(seriesPayload, ["watchlist", "items", "series", "results", "data"]);

    const seriesRows = seriesItems.map((item) => {
        const seriesObject = findValue(item, ["series", "tvShow", "show"]) as Record<string, unknown> | undefined;
        const title = parseString(findValue(seriesObject ?? item, ["title", "name", "seriesTitle"]));
        // 👇 FIXED GENRE HANDLING
        const genresArray = findValue(seriesObject ?? item, ["genres"]) as unknown[];
        const genre = Array.isArray(genresArray)
            ? genresArray.map((g: any) => g.name || g).join(", ")
            : "—";
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
                    headers={["Title", "Genre", "Year", "Added"]}
                    rows={allRows}
                    emptyMessage="No watchlist items found."
                />
            </section>
        </UserPageShell>
    );
}