type DashboardMetric = {
    label: string;
    value: number;
    color: string;
};

type ApprovalMetric = {
    label: string;
    approved: number;
    total: number;
    color: string;
};

type UserDashboardGraphsProps = {
    activityMetrics: DashboardMetric[];
    approvalMetrics: ApprovalMetric[];
    subscription: {
        isActive: boolean;
        plan: string;
    };
};

function formatValue(value: number) {
    return new Intl.NumberFormat("en-US").format(value);
}

function getPercent(approved: number, total: number) {
    if (total <= 0) {
        return 0;
    }

    return Math.min(100, Math.round((approved / total) * 100));
}

function ApprovalRing({ metric }: { metric: ApprovalMetric }) {
    const percent = getPercent(metric.approved, metric.total);
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-900">{metric.label}</p>
                    <p className="mt-1 text-xs text-slate-500">
                        {formatValue(metric.approved)} approved out of {formatValue(metric.total)} total
                    </p>
                </div>

                <div className="relative h-24 w-24 shrink-0">
                    <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
                        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke={metric.color}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-slate-900">{percent}%</span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500">Approved</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function UserDashboardGraphs({ activityMetrics, approvalMetrics, subscription }: UserDashboardGraphsProps) {
    const maxActivity = Math.max(...activityMetrics.map((item) => item.value), 1);

    return (
        <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-6 flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Activity Overview</h2>
                        <p className="mt-1 text-sm text-slate-500">Watchlist, reviews, comments, and contribution counts</p>
                    </div>
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                        4 metrics
                    </span>
                </div>

                <div className="grid grid-cols-4 items-end gap-4">
                    {activityMetrics.map((metric) => {
                        const height = metric.value > 0 ? Math.max((metric.value / maxActivity) * 180, 18) : 10;

                        return (
                            <div key={metric.label} className="flex flex-col items-center gap-3">
                                <span className="text-sm font-semibold text-slate-900">{formatValue(metric.value)}</span>
                                <div className="flex h-52 w-full items-end justify-center rounded-2xl bg-slate-50 px-3 py-4">
                                    <div
                                        className="w-full max-w-14 rounded-t-2xl transition-all"
                                        style={{
                                            height: `${height}px`,
                                            background: metric.color,
                                        }}
                                    />
                                </div>
                                <span className="text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                                    {metric.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">Approval & Subscription</h2>
                    <p className="mt-1 text-sm text-slate-500">Review approval, contribution approval, and subscription state</p>
                </div>

                <div className="space-y-4">
                    {approvalMetrics.map((metric) => (
                        <ApprovalRing key={metric.label} metric={metric} />
                    ))}

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Subscription status</p>
                                <p className="mt-1 text-xs text-slate-500">Current access and active plan information</p>
                            </div>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${subscription.isActive
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                    }`}
                            >
                                {subscription.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>

                        <div className="mt-4 flex items-end justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-slate-500">Plan type</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900">{subscription.plan}</p>
                            </div>

                            <div className="h-3 w-28 overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: subscription.isActive ? "100%" : "30%",
                                        background: subscription.isActive ? "#10b981" : "#f59e0b",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </section>
    );
}