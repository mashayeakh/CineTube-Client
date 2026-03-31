import { Check } from "lucide-react";
import { UserDataTable } from "@/components/user/user-data-table";
import { UserPageShell } from "@/components/user/user-page-shell";
import {
    extractArray,
    findValue,
    formatDate,
    getPrimitiveEntries,
    isRecord,
    parseString,
} from "@/lib/user-dashboard.utils";
import { getUserDashboardSubscriptions } from "@/service/user-dashboard.services";

export default async function UserSubscriptionPage() {
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
        <UserPageShell
            activePath="/user/subscription"
            title="My Subscription"
            subtitle="Manage your plan and billing"
        >
            {/* ── Pricing ── */}
            <section id="pricing" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">Choose a Plan</h2>
                    <p className="mt-1 text-sm text-slate-500">Upgrade to Premium to unlock all features including Movie Contribution.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {/* Monthly */}
                    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 p-6 transition hover:border-slate-300 hover:shadow-sm">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Monthly</p>
                            <p className="mt-2 text-4xl font-bold text-slate-900">
                                $9.99
                                <span className="ml-1 text-sm font-normal text-slate-500">/month</span>
                            </p>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-600">
                            {["Unlimited movie access", "Movie Contribution", "Priority support"].map((f) => (
                                <li key={f} className="flex items-center gap-2">
                                    <Check className="size-4 text-emerald-500" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <button className="mt-auto w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100">
                            Purchase plan
                        </button>
                    </div>

                    {/* Yearly */}
                    <div className="flex flex-col gap-4 rounded-xl border-2 border-slate-900 bg-slate-900 p-6 text-white shadow-lg">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-wider text-slate-300">Yearly</p>
                                <p className="mt-2 text-4xl font-bold">
                                    $99.99
                                    <span className="ml-1 text-sm font-normal text-slate-400">/year</span>
                                </p>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900">Best value</span>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-300">
                            {["Everything in Monthly", "Save ~16% vs monthly", "Early access to new features"].map((f) => (
                                <li key={f} className="flex items-center gap-2">
                                    <Check className="size-4 text-emerald-400" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <button className="mt-auto w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                            Purchase plan
                        </button>
                    </div>
                </div>
            </section>
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
        </UserPageShell>
    );
}
