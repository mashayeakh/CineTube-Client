import { PremiumPageShell } from "@/components/premium/premium-page-shell";
import { UserDataTable } from "@/components/user/user-data-table";
import {
    extractArray,
    findValue,
    formatDate,
    parseString,
} from "@/lib/user-dashboard.utils";
import { getUserDashboardContributions } from "@/service/user-dashboard.services";

export default async function PremiumContributionsPage() {
    let payload: unknown = null;

    try {
        const response = await getUserDashboardContributions();
        payload = response.data;
    } catch {
        payload = null;
    }

    const items = extractArray(payload, ["contributions", "items", "results", "data"]);

    const rows = items.slice(0, 20).map((item) => {
        const title = parseString(findValue(item, ["title", "movieTitle", "name"]));
        const status = parseString(findValue(item, ["status"]));
        const type = parseString(findValue(item, ["type", "contributionType"]));
        const createdAt = formatDate(findValue(item, ["createdAt", "date"]));

        return [title, type, status, createdAt];
    });

    return (
        <PremiumPageShell
            activePath="/premium_user/contributions"
            title="My Contributions"
            subtitle="Data from GET /api/v1/user/dashboard/contributions"
        >
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">Total contributions</p>
                    <p className="text-lg font-semibold text-slate-900">{items.length}</p>
                </div>

                <UserDataTable
                    headers={["Title", "Type", "Status", "Created"]}
                    rows={rows}
                    emptyMessage="No contributions found."
                />
            </section>
        </PremiumPageShell>
    );
}