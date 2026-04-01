import { PremiumPageShell } from "@/components/premium/premium-page-shell";
import { UserDataTable } from "@/components/user/user-data-table";
import {
    extractArray,
    findValue,
    formatDate,
    parseString,
} from "@/lib/user-dashboard.utils";
import { getUserDashboardComments } from "@/service/user-dashboard.services";

export default async function PremiumCommentsPage() {
    let payload: unknown = null;

    try {
        const response = await getUserDashboardComments();
        payload = response.data;
    } catch {
        payload = null;
    }

    const items = extractArray(payload, ["comments", "items", "results", "data"]);

    const rows = items.slice(0, 20).map((item) => {
        const content = parseString(findValue(item, ["content", "comment", "text"]));
        const movie = parseString(findValue(item, ["movieTitle", "title", "movie"]));
        const status = parseString(findValue(item, ["status"]));
        const createdAt = formatDate(findValue(item, ["createdAt", "date"]));

        return [content, movie, status, createdAt];
    });

    return (
        <PremiumPageShell
            activePath="/premium_user/comments"
            title="My Comments"
        >
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">Total comments</p>
                    <p className="text-lg font-semibold text-slate-900">{items.length}</p>
                </div>

                <UserDataTable
                    headers={["Content", "Movie", "Status", "Created"]}
                    rows={rows}
                    emptyMessage="No comments found."
                />
            </section>
        </PremiumPageShell>
    );
}