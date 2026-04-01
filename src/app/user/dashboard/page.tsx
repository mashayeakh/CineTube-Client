import { UserPageShell } from "@/components/user/user-page-shell";
import { UserDashboardGraphs } from "@/components/user/user-dashboard-graphs";
import {
    findValue,
    getPrimitiveEntries,
    parseString,
} from "@/lib/user-dashboard.utils";
import { getUserDashboardStats } from "@/service/user-dashboard.services";

function formatLabel(value: string) {
    return value
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getNumberStat(source: unknown, keys: string[]) {
    const value = findValue(source, keys);

    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
}

function getBooleanStat(source: unknown, keys: string[]) {
    const value = findValue(source, keys);

    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        return value.trim().toLowerCase() === "true";
    }

    return false;
}

export default async function UserDashboardPage() {
    let statsData: unknown = null;

    try {
        const response = await getUserDashboardStats();
        statsData = response.data;
    } catch {
        statsData = null;
    }

    const stats = getPrimitiveEntries(statsData).slice(0, 8);
    const watchlistCount = getNumberStat(statsData, ["watchlistCount"]);
    const reviewCount = getNumberStat(statsData, ["reviewCount"]);
    const approvedReviewCount = getNumberStat(statsData, ["approvedReviewCount"]);
    const commentCount = getNumberStat(statsData, ["commentCount"]);
    const contributionCount = getNumberStat(statsData, ["contributionCount"]);
    const approvedContributionCount = getNumberStat(statsData, ["approvedContributionCount"]);
    const hasActiveSubscription = getBooleanStat(statsData, ["hasActiveSubscription"]);
    const activeSubscriptionType = parseString(findValue(statsData, ["activeSubscriptionType", "subscriptionType"]), "No active plan");

    const activityMetrics = [
        { label: "Watchlist", value: watchlistCount, color: "linear-gradient(180deg, #0ea5e9 0%, #0369a1 100%)" },
        { label: "Reviews", value: reviewCount, color: "linear-gradient(180deg, #6366f1 0%, #4338ca 100%)" },
        { label: "Comments", value: commentCount, color: "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)" },
        { label: "Contributions", value: contributionCount, color: "linear-gradient(180deg, #10b981 0%, #047857 100%)" },
    ];

    const approvalMetrics = [
        { label: "Reviews", approved: approvedReviewCount, total: reviewCount, color: "#4f46e5" },
        { label: "Contributions", approved: approvedContributionCount, total: contributionCount, color: "#059669" },
    ];

    return (
        <UserPageShell
            activePath="/user/dashboard"
            title="Dashboard"
        // subtitle="Stats from GET /api/v1/user/dashboard/stats"
        >
            {stats.length > 0 ? (
                <>
                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((item) => (
                            <article key={item.key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{formatLabel(item.key)}</p>
                                <p className="mt-2 text-2xl font-semibold text-slate-900">{parseString(item.value)}</p>
                            </article>
                        ))}
                    </section>

                    <UserDashboardGraphs
                        activityMetrics={activityMetrics}
                        approvalMetrics={approvalMetrics}
                        subscription={{
                            isActive: hasActiveSubscription,
                            plan: activeSubscriptionType,
                        }}
                    />
                </>
            ) : (
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">No dashboard stats available right now.</p>
                </section>
            )}
        </UserPageShell>
    );
}