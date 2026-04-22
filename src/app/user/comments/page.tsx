import { UserDataTable } from "@/components/user/user-data-table";
import { UserPageShell } from "@/components/user/user-page-shell";
import {
    extractArray,
    findValue,
    formatDate,
    parseString,
} from "@/lib/user-dashboard.utils";
import { getUserDashboardComments } from "@/service/user-dashboard.services";

export default async function UserCommentsPage() {
    let payload: unknown = null;

    try {
        const response = await getUserDashboardComments();
        payload = response.data;
        console.log("REsponse ->>>>", response)
    } catch {
        payload = null;
    }


    const items = extractArray(payload, ["comments", "items", "results", "data"]);

    const rows = items.slice(0, 20).map((item) => {
        const content = parseString(findValue(item, ["content", "comment", "text"]));
        let movie = null;
        let series = null;
        // Check for movie
        if (item.review && item.review.movie && item.review.movie.title) {
            movie = item.review.movie.title;
        } else if (item.movie && item.movie.title) {
            movie = item.movie.title;
        }
        // Check for series
        if (!movie) {
            if (item.review && item.review.series && item.review.series.title) {
                series = item.review.series.title;
            } else if (item.series && item.series.title) {
                series = item.series.title;
            }
        }
        const status = parseString(findValue(item, ["status"]));
        const createdAt = formatDate(findValue(item, ["createdAt", "date"]));

        return [
            content,
            movie === null ? "null" : movie,
            series === null ? "null" : series,
            status,
            createdAt
        ];
    });

    return (
        <UserPageShell
            activePath="/user/comments"
            title="My Comments"
        // subtitle="Data from GET /api/v1/user/dashboard/comments"
        >
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">Total comments</p>
                    <p className="text-lg font-semibold text-slate-900">{items.length}</p>
                </div>

                <UserDataTable
                    headers={["Content", "Movie", "Series", "Status", "Created"]}
                    rows={rows}
                    emptyMessage="No comments found."
                />
            </section>
        </UserPageShell>
    );
}
