import Link from "next/link";
import { Home, LayoutDashboard, Users, Film, MessageSquare, DollarSign, RefreshCw } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    getAdminDashboardComments,
    getAdminDashboardMovies,
    getAdminDashboardMovieContributions,
    getAdminDashboardPayments,
    getAdminDashboardRevenueStats,
    getAdminDashboardReviewsPerDayChart,
    getAdminDashboardStats,
    getAdminDashboardUsers,
    getAdminDashboardSubscriptions,
    getAdminDashboardTopWatchlistMovies,
    getAdminDashboardWatchlistCounts,
    getPendingAdminDashboardReviews,
} from "@/service/admin-dashboard.services";
import { getAdminReviews } from "@/service/admin-review.services";

// Sub-components
import { OverviewTab } from "@/components/admin/dashboard/OverviewTab";
import { UsersTab } from "@/components/admin/dashboard/UsersTab";
import { ContentTab } from "@/components/admin/dashboard/ContentTab";
import { CommunityTab } from "@/components/admin/dashboard/CommunityTab";
import { MonetizationTab } from "@/components/admin/dashboard/MonetizationTab";

// Utilities
import {
    extractArray,
    formatCurrency,
    formatDate,
    formatNumber,
    formatRole,
    getStatusVariant,
    pickBoolean,
    pickNumber,
    pickString,
    shortenLabel,
    findValue,
    parseNumber,
    parseString
} from "./utils";

function getSuccessData<TData>(result: PromiseSettledResult<any>, fallback: TData) {
    return result.status === "fulfilled" ? result.value.data : fallback;
}

function normalizeUsers(source: unknown) {
    return extractArray(source, ["users", "items", "rows", "records"])
        .map((item, index) => {
            const email = pickString(item, ["email", "userEmail", "contactEmail"]);
            const isBlocked = pickBoolean(item, ["isBlocked"]);
            const status = isBlocked ? "Blocked" : formatRole(pickString(item, ["status", "accountStatus", "state"], "Active"));

            return {
                id: pickString(item, ["_id", "id", "userId"], `user-${index + 1}`),
                name: pickString(item, ["name", "fullName", "username"], email.split("@")[0] || "Unnamed user"),
                email: email || "No email",
                role: formatRole(pickString(item, ["role", "userRole"], "User")),
                status,
                joinedAt: formatDate(pickString(item, ["createdAt", "joinedAt", "updatedAt"])),
            };
        })
        .slice(0, 6);
}

function normalizeMovies(source: unknown) {
    return extractArray(source, ["movies", "items", "rows", "records"])
        .map((item, index) => {
            const genreSource = findValue(item, ["genres", "genre", "category"]);
            const genre = Array.isArray(genreSource)
                ? genreSource
                    .map((entry) => (typeof entry === "object" ? pickString(entry, ["name", "title"], "") : String(entry)))
                    .filter(Boolean)
                    .slice(0, 2)
                    .join(", ")
                : parseString(genreSource, "Feature film");

            const releaseDate = pickString(item, ["releaseDate", "releasedAt", "createdAt"]);
            const releaseYear = releaseDate ? String(new Date(releaseDate).getFullYear()).replace("NaN", "TBA") : pickString(item, ["releaseYear", "year"], "TBA");

            return {
                id: pickString(item, ["_id", "id", "movieId"], `movie-${index + 1}`),
                title: pickString(item, ["title", "name", "movieTitle"], `Movie ${index + 1}`),
                genre: genre || "Feature film",
                status: formatRole(pickString(item, ["status", "publishStatus", "approvalStatus"], "Published")),
                rating: pickNumber(item, ["averageRating", "rating", "imdbRating"]),
                releaseYear,
            };
        })
        .slice(0, 6);
}

function normalizePayments(source: unknown) {
    return extractArray(source, ["payments", "items", "rows", "records"])
        .map((item, index) => ({
            id: pickString(item, ["_id", "id", "paymentId"], `payment-${index + 1}`),
            email: pickString(item, ["email", "customerEmail", "payerEmail"], "Unknown payer"),
            amount: pickNumber(item, ["amount", "total", "price"]),
            status: formatRole(pickString(item, ["status", "paymentStatus"], "Pending")),
            method: formatRole(pickString(item, ["method", "paymentMethod", "provider"], "Online")),
            createdAt: formatDate(pickString(item, ["createdAt", "paidAt", "updatedAt"])),
        }))
        .slice(0, 6);
}

function normalizeReviews(source: unknown) {
    return extractArray(source, ["reviews", "items", "rows", "records"])
        .map((item, index) => ({
            id: pickString(item, ["_id", "id", "reviewId"], `review-${index + 1}`),
            author: pickString(item, ["author", "userName", "username", "name"], "Anonymous reviewer"),
            excerpt: pickString(item, ["content", "review", "message", "text"], "Pending moderation"),
            status: formatRole(pickString(item, ["status", "moderationStatus"], "Pending")),
            createdAt: formatDate(pickString(item, ["createdAt", "submittedAt", "updatedAt"])),
            spoiler: pickBoolean(item, ["spoiler", "isSpoiler"]),
        }))
        .slice(0, 5);
}

function normalizeContributions(source: unknown) {
    return extractArray(source, ["contributions", "items", "rows", "records"])
        .map((item, index) => ({
            id: pickString(item, ["_id", "id", "contributionId"], `contribution-${index + 1}`),
            title: pickString(item, ["title", "movieTitle", "name"], `Contribution ${index + 1}`),
            submittedBy: pickString(item, ["submittedBy", "author", "email", "username"], "Community member"),
            status: formatRole(pickString(item, ["status", "approvalStatus"], "Pending")),
            createdAt: formatDate(pickString(item, ["createdAt", "submittedAt", "updatedAt"])),
        }))
        .slice(0, 5);
}

function normalizeTopMovies(source: unknown) {
    return extractArray(source, ["movies", "topMovies", "items", "rows", "records"])
        .map((item, index) => ({
            id: pickString(item, ["_id", "id", "movieId"], `watchlist-${index + 1}`),
            title: pickString(item, ["title", "name", "movieTitle"], `Movie ${index + 1}`),
            count: pickNumber(item, ["count", "watchlistCount", "total", "savedCount"]),
            rating: pickNumber(item, ["averageRating", "rating", "score"]),
        }))
        .slice(0, 5);
}

function normalizeSeries(source: unknown, labelFallbackPrefix: string, valueKeys: string[]) {
    const items = extractArray(source, ["series", "data", "items", "rows", "records", "points"]);
    if (items.length > 0) {
        return items.map((item, index) => {
            if (typeof item === "number") return { label: `${labelFallbackPrefix} ${index + 1}`, value: item };
            const label = shortenLabel(pickString(item, ["label", "month", "date", "day", "name"], `${labelFallbackPrefix} ${index + 1}`), `${labelFallbackPrefix} ${index + 1}`);
            const value = pickNumber(item, valueKeys);
            return { label, value };
        }).filter(Boolean);
    }
    return [];
}

function countByStatus(source: unknown, terms: string[]) {
    const normalizedTerms = terms.map((term) => term.toLowerCase());
    return extractArray(source, ["reviews", "items", "rows", "records", "result", "data"]).filter((item) => {
        const status = pickString(item, ["status", "state", "moderationStatus"]).toLowerCase();
        return normalizedTerms.some((term) => status.includes(term));
    }).length;
}

export default async function AdminDashboardPage() {
    const requests = await Promise.allSettled([
        getAdminDashboardStats(),
        getAdminDashboardUsers(),
        getAdminReviews(),
        getAdminDashboardMovies(),
        getPendingAdminDashboardReviews(),
        getAdminDashboardComments(),
        getAdminDashboardMovieContributions(),
        getAdminDashboardPayments(),
        getAdminDashboardRevenueStats(),
        getAdminDashboardSubscriptions(),
        getAdminDashboardTopWatchlistMovies(),
        getAdminDashboardWatchlistCounts(),
        getAdminDashboardReviewsPerDayChart(),
    ]);

    // Extraction
    const stats = getSuccessData(requests[0], {});
    const usersData = getSuccessData(requests[1], []);
    const users = normalizeUsers(usersData);
    const allReviewsData = requests[2].status === "fulfilled" ? requests[2].value : [];
    const movies = normalizeMovies(getSuccessData(requests[3], []));
    const pendingReviews = normalizeReviews(getSuccessData(requests[4], []));
    const comments = extractArray(getSuccessData(requests[5], []), ["comments", "items", "rows", "records"]);
    const contributionsData = getSuccessData(requests[6], []);
    const contributions = normalizeContributions(contributionsData);
    const payments = normalizePayments(getSuccessData(requests[7], []));
    const revenueStats = getSuccessData(requests[8], {});
    const subscriptions = extractArray(getSuccessData(requests[9], []), ["subscriptions", "items", "rows", "records"]);
    const topWatchlistMovies = normalizeTopMovies(getSuccessData(requests[10], []));
    const watchlistCounts = getSuccessData(requests[11], {});
    const reviewsPerDay = normalizeSeries(getSuccessData(requests[12], []), "D", ["count", "reviews", "total", "value"]);

    // Aggregates
    const totalUsers = pickNumber(stats, ["totalUsers", "userCount", "users", "totalUserCount"], users.length);
    const totalMovies = pickNumber(stats, ["totalMovies", "movieCount", "movies", "totalMovieCount"], movies.length);
    const totalContributedMovies = pickNumber(contributionsData, ["totalMovieContributions", "totalContributions", "totalCount", "count", "total"], 0);
    const totalMoviesWithContributions = totalMovies + totalContributedMovies;
    const reviewQueue = pickNumber(stats, ["pendingReviews", "reviewQueue", "totalPendingReviews"], pendingReviews.length);
    const totalRevenue = pickNumber(revenueStats, ["totalRevenue", "revenue", "lifetimeRevenue", "grossRevenue"]);
    const activeSubscriptions = pickNumber(stats, ["activeSubscriptions", "subscriptions", "totalSubscriptions"], subscriptions.length);
    const watchlistEntries = pickNumber(watchlistCounts, ["total", "totalWatchlists", "watchlistCount", "totalWatchlistEntries"], 0);
    
    const approvedCount = countByStatus(allReviewsData, ["approved"]);
    const pendingCount = countByStatus(allReviewsData, ["pending"]);
    const rejectedCount = countByStatus(allReviewsData, ["reject"]);

    const trendPoints = reviewsPerDay.slice(-30);
    const todayCount = trendPoints.at(-1)?.value ?? 0;
    const yesterdayCount = trendPoints.at(-2)?.value ?? 0;
    const weekCount = trendPoints.slice(-7).reduce((sum, point) => sum + (point?.value ?? 0), 0);
    const previousWeekCount = trendPoints.slice(-14, -7).reduce((sum, point) => sum + (point?.value ?? 0), 0);
    
    const revenueInThousands = totalRevenue > 0 ? `${(totalRevenue / 1000).toFixed(1)}k` : "0k";
    
    const systemSummarySlices = [
        { label: "Users", value: totalUsers, color: "#2563eb" },
        { label: "Movies", value: totalMovies, color: "#0f766e" },
        { label: "Pending", value: pendingCount, color: "#ca8a04" },
        { label: "Paid", value: payments.filter(p => p.status === "Completed").length, color: "#7c3aed" },
    ];

    const healthPercent = Math.round((requests.filter(r => r.status === "fulfilled").length / requests.length) * 100);

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/dashboard" />

                <div className="min-w-0 flex flex-col">
                    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-slate-50/90 px-6 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-600 p-1.5 text-white shadow-lg shadow-blue-200">
                                <LayoutDashboard className="size-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold tracking-tight text-slate-900">Dashboard</p>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Operational Insights</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link href="/" className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300">
                                <Home className="size-3.5 transition-transform group-hover:-translate-y-0.5" />
                                <span className="hidden sm:inline">Back Home</span>
                            </Link>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.05),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(2,132,199,0.05),transparent_50%)] p-6">
                        <div className="mx-auto max-w-7xl">
                            <Tabs defaultValue="overview" className="space-y-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <TabsList className="h-11 bg-white p-1 shadow-sm border border-slate-200/60 rounded-2xl">
                                        <TabsTrigger value="overview" className="rounded-xl px-4 text-xs font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                                            <LayoutDashboard className="mr-2 size-3.5" />
                                            Overview
                                        </TabsTrigger>
                                        <TabsTrigger value="users" className="rounded-xl px-4 text-xs font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                                            <Users className="mr-2 size-3.5" />
                                            Users
                                        </TabsTrigger>
                                        <TabsTrigger value="content" className="rounded-xl px-4 text-xs font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                                            <Film className="mr-2 size-3.5" />
                                            Content
                                        </TabsTrigger>
                                        <TabsTrigger value="community" className="rounded-xl px-4 text-xs font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                                            <MessageSquare className="mr-2 size-3.5" />
                                            Community
                                        </TabsTrigger>
                                        <TabsTrigger value="monetization" className="rounded-xl px-4 text-xs font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                                            <DollarSign className="mr-2 size-3.5" />
                                            Finances
                                        </TabsTrigger>
                                    </TabsList>

                                    <div className="flex items-center gap-2">
                                        <div className="flex h-11 items-center gap-3 rounded-2xl border border-slate-200/60 bg-white px-4 shadow-sm">
                                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live Updates</span>
                                        </div>
                                        <button className="flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-xs font-bold text-white shadow-lg shadow-slate-200 transition-all hover:bg-slate-800 active:scale-95">
                                            <RefreshCw className="size-3.5" />
                                            <span className="hidden sm:inline">Refresh Data</span>
                                        </button>
                                    </div>
                                </div>

                                <TabsContent value="overview">
                                    <OverviewTab 
                                        {...{stats, users, totalUsers, sUsers: totalUsers, adminUsers: 1, premiumUsers: 0, totalMoviesWithContributions, adminAddedMovies: totalMovies, totalContributedMovies, watchlistEntries, healthPercent, requests, approvedCount, pendingCount, rejectedCount, reviewQueue, todayCount, todayDeltaText: `${todayCount - yesterdayCount > 0 ? "+" : ""}${todayCount - yesterdayCount} from yesterday`, weekCount, weekDeltaText: `${weekCount - previousWeekCount > 0 ? "+" : ""}${weekCount - previousWeekCount} from last week`, monthCount: 0, topMovieTitle: "N/A", activeUsersCount: totalUsers, paidPaymentsCount: payments.length, revenueInThousands, weekDelta: weekCount - previousWeekCount, systemSummarySlices, payments, pendingPaymentsCount: 0, failedPaymentsCount: 0, formatNumber, formatCurrency, getStatusVariant, DonutChart: ({value, total, color}: any) => {
                                            const angle = Math.round((value / Math.max(total, 1)) * 360);
                                            return (
                                                <div className="relative flex size-32 items-center justify-center rounded-full bg-slate-100 shadow-inner" style={{ background: `conic-gradient(${color} ${angle}deg, #f1f5f9 ${angle}deg)` }}>
                                                    <div className="flex size-24 items-center justify-center rounded-full bg-white text-lg font-black text-slate-900 shadow-sm">
                                                        {Math.round((value / Math.max(total, 1)) * 100)}%
                                                    </div>
                                                </div>
                                            )
                                        }}} 
                                    />
                                </TabsContent>

                                <TabsContent value="users">
                                    <UsersTab users={users} totalUsers={totalUsers} formatNumber={formatNumber} getStatusVariant={getStatusVariant} />
                                </TabsContent>

                                <TabsContent value="content">
                                    <ContentTab 
                                        movies={movies} 
                                        contributions={contributions} 
                                        topWatchlistMovies={topWatchlistMovies} 
                                        totalMovies={totalMovies} 
                                        totalContributedMovies={totalContributedMovies} 
                                        formatNumber={formatNumber} 
                                        getStatusVariant={getStatusVariant} 
                                    />
                                </TabsContent>

                                <TabsContent value="community">
                                    <CommunityTab 
                                        pendingReviews={pendingReviews} 
                                        comments={comments} 
                                        pendingCount={pendingCount} 
                                        reviewQueue={reviewQueue} 
                                        formatNumber={formatNumber} 
                                        getStatusVariant={getStatusVariant} 
                                    />
                                </TabsContent>

                                <TabsContent value="monetization">
                                    <MonetizationTab 
                                        payments={payments} 
                                        totalRevenue={totalRevenue} 
                                        paidPaymentsCount={payments.filter(p => p.status === "Completed").length} 
                                        activeSubscriptions={activeSubscriptions} 
                                        formatNumber={formatNumber} 
                                        formatCurrency={formatCurrency} 
                                        getStatusVariant={getStatusVariant} 
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
