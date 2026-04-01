import { PremiumPageShell } from "@/components/premium/premium-page-shell";
import { UserDataTable } from "@/components/user/user-data-table";
import {
    extractArray,
    findValue,
    formatDate,
    getPrimitiveEntries,
    parseString,
} from "@/lib/user-dashboard.utils";
import { getUserDashboardSubscriptions } from "@/service/user-dashboard.services";

export default async function PremiumSubscriptionPage() {
    let payload: unknown = null;

    try {
        const response = await getUserDashboardSubscriptions();
        payload = response.data;
    } catch {
        payload = null;
    }

    const items = extractArray(payload, ["subscriptions", "items", "results", "data"]);
    const summary = getPrimitiveEntries(payload).slice(0, 6);

    const rows = items.slice(0, 20).map((item) => {
        const plan = parseString(findValue(item, ["plan", "planName", "package"]));
        const status = parseString(findValue(item, ["status"]));
        const start = formatDate(findValue(item, ["startDate", "startedAt", "createdAt"]));
        const end = formatDate(findValue(item, ["endDate", "expiresAt", "expiryDate"]));

        return [plan, status, start, end];
    });

    return (
        <PremiumPageShell
            activePath="/premium_user/subscription"
            title="My Subscription"
        // subtitle="Data from GET /api/v1/user/dashboard/subscriptions"
        >
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                {summary.length > 0 && (
                    <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {summary.map((item) => (
                            <article key={item.key} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <p className="text-xs uppercase tracking-wider text-slate-500">{item.key}</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
                            </article>
                        ))}
                    </div>
                )}

                <UserDataTable
                    headers={["Plan", "Status", "Start Date", "End Date"]}
                    rows={rows}
                    emptyMessage="No subscription records found."
                />
            </section>
        </PremiumPageShell>
    );
}