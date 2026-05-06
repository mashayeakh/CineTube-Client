import React from "react";
import { 
  Users, 
  CalendarCheck2, 
  Activity, 
  CheckCircle2, 
  CircleDashed, 
  CircleAlert,
  TrendingUp,
  PieChart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SystemSummaryChart } from "@/components/admin/system-summary-chart";

interface OverviewTabProps {
  stats: any;
  users: any[];
  totalUsers: number;
  sUsers: number;
  adminUsers: number;
  premiumUsers: number;
  totalMoviesWithContributions: number;
  adminAddedMovies: number;
  totalContributedMovies: number;
  watchlistEntries: number;
  healthPercent: number;
  requests: any[];
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  reviewQueue: number;
  todayCount: number;
  todayDeltaText: string;
  weekCount: number;
  weekDeltaText: string;
  monthCount: number;
  topMovieTitle: string;
  activeUsersCount: number;
  paidPaymentsCount: number;
  revenueInThousands: string;
  weekDelta: number;
  systemSummarySlices: any[];
  payments: any[];
  pendingPaymentsCount: number;
  failedPaymentsCount: number;
  DonutChart: React.FC<any>;
  formatNumber: (v: number) => string;
  formatCurrency: (v: number) => string;
}

export function OverviewTab({
  stats,
  users,
  totalUsers,
  sUsers,
  adminUsers,
  premiumUsers,
  totalMoviesWithContributions,
  adminAddedMovies,
  totalContributedMovies,
  watchlistEntries,
  healthPercent,
  requests,
  approvedCount,
  pendingCount,
  rejectedCount,
  reviewQueue,
  todayCount,
  todayDeltaText,
  weekCount,
  weekDeltaText,
  monthCount,
  topMovieTitle,
  activeUsersCount,
  paidPaymentsCount,
  revenueInThousands,
  weekDelta,
  systemSummarySlices,
  payments,
  pendingPaymentsCount,
  failedPaymentsCount,
  DonutChart,
  formatNumber,
  formatCurrency,
}: OverviewTabProps) {
  const failedFeeds = requests.length - requests.filter((r: any) => r.status === "fulfilled").length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Stats Grid */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Users className="size-5" />
            </div>
            <Badge variant="secondary">+{Math.max(activeUsersCount, 0)}%</Badge>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500">Total Users</p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-slate-900">{formatNumber(totalUsers)}</p>
          <div className="mt-3 text-xs text-slate-500 flex flex-wrap gap-2">
            <span><span className="text-violet-500 font-bold">•</span> Users: {formatNumber(sUsers)}</span>
            <span><span className="text-orange-500 font-bold">•</span> Admin: {formatNumber(adminUsers)}</span>
            <span><span className="text-emerald-500 font-bold">•</span> Premium: {formatNumber(premiumUsers)}</span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-2 rounded-full bg-blue-500 transition-all duration-1000" style={{ width: `${Math.min(healthPercent + 15, 100)}%` }} />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CalendarCheck2 className="size-5" />
            </div>
            <Badge variant="secondary">+8.2%</Badge>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500">Total Content</p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-slate-900">{formatNumber(totalMoviesWithContributions)}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] uppercase tracking-wider text-slate-500">
            <div>
              Admin
              <span className="mt-0.5 block text-sm font-bold text-slate-800">{formatNumber(adminAddedMovies)}</span>
            </div>
            <div>
              Contrib.
              <span className="mt-0.5 block text-sm font-bold text-slate-800">{formatNumber(totalContributedMovies)}</span>
            </div>
            <div>
              Saves
              <span className="mt-0.5 block text-sm font-bold text-slate-800">{formatNumber(watchlistEntries)}</span>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-2 rounded-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min((watchlistEntries / Math.max(totalMoviesWithContributions, 1)) * 100, 100)}%` }} />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-orange-50 p-2.5 text-orange-600">
              <Activity className="size-5" />
            </div>
            <Badge variant={failedFeeds > 0 ? "destructive" : "secondary"}>{failedFeeds > 0 ? `${failedFeeds} feeds down` : "Healthy"}</Badge>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500">System Health</p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-slate-900">{healthPercent}%</p>
          <p className="mt-2 text-xs text-slate-500">{requests.filter((r: any) => r.status === "fulfilled").length} / {requests.length} services operational</p>
          <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-2 rounded-full bg-orange-500 transition-all duration-1000" style={{ width: `${healthPercent}%` }} />
          </div>
        </article>
      </section>

      {/* Middle Charts & Metrics */}
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold tracking-tight text-slate-900">Moderation Overview</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
              <div>
                <p className="text-xs font-medium text-emerald-700">Approved</p>
                <p className="text-xl font-bold text-slate-900">{formatNumber(approvedCount)}</p>
              </div>
              <CheckCircle2 className="size-5 text-emerald-500" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5">
              <div>
                <p className="text-xs font-medium text-amber-700">Pending</p>
                <p className="text-xl font-bold text-slate-900">{formatNumber(pendingCount || reviewQueue)}</p>
              </div>
              <CircleDashed className="size-5 text-amber-500 animate-spin-slow" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5">
              <div>
                <p className="text-xs font-medium text-rose-700">Rejected</p>
                <p className="text-xl font-bold text-slate-900">{formatNumber(rejectedCount)}</p>
              </div>
              <CircleAlert className="size-5 text-rose-500" />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold tracking-tight text-slate-900">Engagement Trends</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-blue-50/50 px-3 py-2.5 border border-blue-100">
              <p className="text-xs font-medium text-blue-700">Today</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-900">{formatNumber(todayCount)}</p>
                <p className="text-[10px] text-slate-500">{todayDeltaText}</p>
              </div>
            </div>
            <div className="rounded-xl bg-emerald-50/50 px-3 py-2.5 border border-emerald-100">
              <p className="text-xs font-medium text-emerald-700">This Week</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-900">{formatNumber(weekCount)}</p>
                <p className="text-[10px] text-slate-500">{weekDeltaText}</p>
              </div>
            </div>
            <div className="rounded-xl bg-violet-50/50 px-3 py-2.5 border border-violet-100">
              <p className="text-xs font-medium text-violet-700">Monthly High</p>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(monthCount)}</p>
              <p className="text-[10px] text-slate-500 truncate">Top: {topMovieTitle}</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight text-slate-900">Quick Actions</h3>
            <TrendingUp className={cn("size-4", weekDelta >= 0 ? "text-emerald-500" : "text-rose-500")} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 text-center">
              <p className="text-2xl font-bold text-blue-600">{formatNumber(activeUsersCount)}</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase">Active</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 text-center">
              <p className="text-2xl font-bold text-emerald-600">{formatNumber(paidPaymentsCount)}</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase">Paid</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 text-center">
              <p className="text-2xl font-bold text-orange-600">{formatNumber(totalMoviesWithContributions)}</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase">Movies</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 text-center">
              <p className="text-2xl font-bold text-violet-600">{revenueInThousands}</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase">Rev (K)</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
             <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Growth Rate</p>
                <span className={cn("text-xs font-bold", weekDelta >= 0 ? "text-emerald-600" : "text-rose-600")}>
                    {weekDelta >= 0 ? "+" : ""}{weekDelta}%
                </span>
             </div>
             <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000", weekDelta >= 0 ? "bg-emerald-500" : "bg-rose-500")}
                  style={{ width: `${Math.min(Math.abs(weekDelta) * 5 + 10, 100)}%` }}
                />
             </div>
          </div>
        </article>
      </section>

      {/* Large Visualizations */}
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">System Distribution</h3>
              <p className="text-sm text-slate-500">Cross-platform metric composition</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <PieChart className="size-5" />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <SystemSummaryChart slices={systemSummarySlices} />
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">Payment Status</h3>
          <p className="text-sm text-slate-500">Recent transaction processing health</p>

          <div className="mt-8 flex items-center justify-center">
            <DonutChart
              value={paidPaymentsCount}
              total={Math.max(payments.length, 1)}
              color="#16a34a"
            />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-emerald-50/30 p-3">
              <span className="font-medium text-slate-600">Paid</span>
              <span className="font-bold text-emerald-600">{formatNumber(paidPaymentsCount)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-amber-50/30 p-3">
              <span className="font-medium text-slate-600">Pending</span>
              <span className="font-bold text-amber-600">{formatNumber(pendingPaymentsCount)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-rose-50/30 p-3">
              <span className="font-medium text-slate-600">Failed</span>
              <span className="font-bold text-rose-600">{formatNumber(failedPaymentsCount)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
              <span className="font-bold text-slate-700">Total</span>
              <span className="font-bold text-slate-900">{formatNumber(payments.length)}</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
