import { UserDataTable } from "@/components/user/user-data-table";
import { UserPageShell } from "@/components/user/user-page-shell";
import {
    extractArray,
    findValue,
    formatDate,
    parseString,
} from "@/lib/user-dashboard.utils";
import { getUserDashboardReviews } from "@/service/user-dashboard.services";

export default async function UserReviewsPage() {
    let payload: unknown = null;

    try {
        const response = await getUserDashboardReviews();
        payload = response.data;
    } catch {
        payload = null;
    }

    const items = extractArray(payload, ["reviews", "items", "results", "data"]);

    const rows = items.slice(0, 20).map((item) => {
        const content = parseString(findValue(item, ["content", "review", "description"]));
        const rating = parseString(findValue(item, ["rating", "stars"]));
        const spoiler = parseString(findValue(item, ["spoiler", "isSpoiler"]));
        const status = parseString(findValue(item, ["status"]));
        const createdAt = formatDate(findValue(item, ["createdAt", "date"]));

        return [content, rating, spoiler, status, createdAt];
    });

    return (
        <UserPageShell
            activePath="/user/reviews"
            title="My Reviews"
            subtitle="Data from GET /api/v1/user/dashboard/reviews"
        >
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
        </UserPageShell>
    );
}
