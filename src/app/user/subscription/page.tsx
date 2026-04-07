import { UserDataTable } from "@/components/user/user-data-table";
import { UserPageShell } from "@/components/user/user-page-shell";
import {
    extractArray,
    findValue,
    formatDate,
    getPrimitiveEntries,
    parseString,
} from "@/lib/user-dashboard.utils";
import { getUserDashboardSubscriptions } from "@/service/user-dashboard.services";
import { PricingCards } from "./_components/PricingCards";

type Plan = "MONTHLY" | "YEARLY";

function normalizePlan(value: string): Plan | null {
    const normalized = value.trim().toUpperCase();

    if (normalized.includes("YEAR")) {
        return "YEARLY";
    }

    if (normalized.includes("MONTH")) {
        return "MONTHLY";
    }

    return null;
}

function isActiveSubscription(status: string, endDateValue: unknown) {
    const normalizedStatus = status.trim().toUpperCase();

    if (normalizedStatus !== "ACTIVE") {
        return false;
    }

    if (typeof endDateValue !== "string" || endDateValue.length === 0) {
        return true;
    }

    const endDate = new Date(endDateValue);

    if (Number.isNaN(endDate.getTime())) {
        return true;
    }

    return endDate.getTime() >= Date.now();
}

function isPendingSubscription(status: string) {
    const normalizedStatus = status.trim().toUpperCase();

    return normalizedStatus.includes("PENDING") || normalizedStatus.includes("PROCESS") || normalizedStatus.includes("REVIEW");
}

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

    const activeRecord = items.find((item) => {
        const status = parseString(findValue(item, ["status"]), "");
        const endDateValue = findValue(item, ["endDate", "expiresAt", "expiryDate"]);

        return isActiveSubscription(status, endDateValue);
    });
    const pendingRecord = items.find((item) => {
        const status = parseString(findValue(item, ["status"]), "");

        return isPendingSubscription(status);
    });

    const activePlan = activeRecord
        ? normalizePlan(parseString(findValue(activeRecord, ["plan", "planName", "package", "type", "subscriptionType"]), ""))
        : null;
    const activeEndsAt = activeRecord
        ? formatDate(findValue(activeRecord, ["endDate", "expiresAt", "expiryDate"]))
        : null;
    const hasActiveSubscription = Boolean(activeRecord);
    const pendingPlan = pendingRecord
        ? normalizePlan(parseString(findValue(pendingRecord, ["plan", "planName", "package", "type", "subscriptionType"]), ""))
        : null;
    const hasPendingSubscription = Boolean(pendingRecord);

    const rows = items.slice(0, 20).map((item) => {
        const plan = parseString(findValue(item, ["plan", "planName", "package", "type", "subscriptionType"]));
        const status = parseString(findValue(item, ["status"]));
        const start = formatDate(findValue(item, ["startDate", "startedAt", "createdAt"]));
        const end = formatDate(findValue(item, ["endDate", "expiresAt", "expiryDate"]));

        return [plan, status, start, end];
    });

    return (
        <UserPageShell
            activePath="/user/subscription"
            title="My Subscription"
        // subtitle="Manage your plan and billing"
        >
            {/* ── Pricing ── */}
            <section id="pricing" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">Choose a Plan</h2>
                    <p className="mt-1 text-sm text-slate-500">Upgrade to Premium to unlock all features including Movie Contribution.</p>
                </div>

                {hasPendingSubscription && (
                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        Your payment is pending admin confirmation. Once the admin marks it as Active, your selected plan will become available and you can use premium features.
                    </div>
                )}

                <PricingCards
                    activePlan={activePlan}
                    activeEndsAt={activeEndsAt}
                    hasActiveSubscription={hasActiveSubscription}
                    pendingPlan={pendingPlan}
                    hasPendingSubscription={hasPendingSubscription}
                />
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
