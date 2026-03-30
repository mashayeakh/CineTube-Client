import Link from "next/link";
import {
    Activity,
    BarChart3,
    Bell,
    CalendarCheck2,
    CheckCircle2,
    CircleAlert,
    CircleDashed,
    Home,
    Search,
    TrendingUp,
    Users,
} from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    getAdminDashboardComments,
    getAdminDashboardMovies,
    getAdminDashboardMovieContributions,
    getAdminDashboardPayments,
    getAdminDashboardRevenueStats,
    getAdminDashboardReviewsPerDayChart,
    getAdminDashboardStats,
    getAdminDashboardSubscriptions,
    getAdminDashboardTopWatchlistMovies,
    getAdminDashboardUsers,
    getAdminDashboardWatchlistCounts,
    getPendingAdminDashboardReviews,
    type AdminServiceResponse,
} from "@/service/admin-dashboard.services";

type UnknownRecord = Record<string, unknown>;

type SeriesPoint = {
    label: string;
    value: number;
};

type UserItem = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    joinedAt: string;
};

type MovieItem = {
    id: string;
    title: string;
    genre: string;
    status: string;
    rating: number;
    releaseYear: string;
};

type PaymentItem = {
    id: string;
    email: string;
    amount: number;
    status: string;
    method: string;
    createdAt: string;
};

type ReviewItem = {
    id: string;
    author: string;
    excerpt: string;
    status: string;
    createdAt: string;
    spoiler: boolean;
};

type ContributionItem = {
    id: string;
    title: string;
    submittedBy: string;
    status: string;
    createdAt: string;
};

type TopMovieItem = {
    id: string;
    title: string;
    count: number;
    rating: number;
};

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeKey(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findValue(source: unknown, keys: string[], depth = 0): unknown {
    if (!isRecord(source) || depth > 3) {
        return undefined;
    }

    const targetKeys = new Set(keys.map(normalizeKey));

    for (const [key, value] of Object.entries(source)) {
        if (targetKeys.has(normalizeKey(key))) {
            return value;
        }
    }

    for (const value of Object.values(source)) {
        if (isRecord(value)) {
            const nestedValue = findValue(value, keys, depth + 1);

            if (nestedValue !== undefined) {
                return nestedValue;
            }
        }
    }

    return undefined;
}

function parseNumber(value: unknown) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string") {
        const normalized = value.replace(/[^0-9.-]/g, "");
        const parsed = Number(normalized);

        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return undefined;
}

function parseString(value: unknown, fallback = "") {
    if (typeof value === "string") {
        return value.trim() || fallback;
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    return fallback;
}

function pickNumber(source: unknown, keys: string[], fallback = 0) {
    const parsed = parseNumber(findValue(source, keys));
    return parsed ?? fallback;
}

function pickString(source: unknown, keys: string[], fallback = "") {
    return parseString(findValue(source, keys), fallback);
}

function pickBoolean(source: unknown, keys: string[], fallback = false) {
    const value = findValue(source, keys);

    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        const normalized = value.toLowerCase();

        if (["true", "yes", "spoiler", "blocked", "active"].includes(normalized)) {
            return true;
        }

        if (["false", "no", "clean", "inactive"].includes(normalized)) {
            return false;
        }
    }

    return fallback;
}

function extractArray(source: unknown, keys: string[] = []) {
    if (Array.isArray(source)) {
        return source;
    }

    const keyedValue = findValue(source, keys);

    if (Array.isArray(keyedValue)) {
        return keyedValue;
    }

    if (isRecord(source)) {
        for (const value of Object.values(source)) {
            if (Array.isArray(value)) {
                return value;
            }
        }
    }

    return [] as unknown[];
}

function formatNumber(value: number) {
    return new Intl.NumberFormat("en-US").format(value);
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Recently updated";
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
    }).format(date);
}

function formatRole(value: string) {
    return value
        .replace(/[_-]+/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (character) => character.toUpperCase()) || "Unknown";
}

function shortenLabel(value: string, fallback: string) {
    const normalized = value.trim();

    if (!normalized) {
        return fallback;
    }

    const date = new Date(normalized);

    if (!Number.isNaN(date.getTime())) {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
        }).format(date);
    }

    if (normalized.length <= 10) {
        return normalized;
    }

    return normalized.slice(0, 10);
}

function getSuccessData<TData>(result: PromiseSettledResult<AdminServiceResponse<TData>>, fallback: TData) {
    return result.status === "fulfilled" ? result.value.data : fallback;
}

function countFulfilled(results: PromiseSettledResult<unknown>[]) {
    return results.filter((result) => result.status === "fulfilled").length;
}

function normalizeUsers(source: unknown): UserItem[] {
    return extractArray(source, ["users", "items", "rows", "records"])
        .map((item, index) => {
            const email = pickString(item, ["email", "userEmail", "contactEmail"]);
            const isBlocked = pickBoolean(item, ["isBlocked"]);
            const status = isBlocked
                ? "Blocked"
                : formatRole(pickString(item, ["status", "accountStatus", "state"], "Active"));

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

function normalizeMovies(source: unknown): MovieItem[] {
    return extractArray(source, ["movies", "items", "rows", "records"])
        .map((item, index) => {
            const genreSource = findValue(item, ["genres", "genre", "category"]);
            const genre = Array.isArray(genreSource)
                ? genreSource
                    .map((entry) => (isRecord(entry) ? pickString(entry, ["name", "title"], "") : parseString(entry, "")))
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

function normalizePayments(source: unknown): PaymentItem[] {
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

function normalizeReviews(source: unknown): ReviewItem[] {
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

function normalizeContributions(source: unknown): ContributionItem[] {
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

function normalizeTopMovies(source: unknown): TopMovieItem[] {
    return extractArray(source, ["movies", "topMovies", "items", "rows", "records"])
        .map((item, index) => ({
            id: pickString(item, ["_id", "id", "movieId"], `watchlist-${index + 1}`),
            title: pickString(item, ["title", "name", "movieTitle"], `Movie ${index + 1}`),
            count: pickNumber(item, ["count", "watchlistCount", "total", "savedCount"]),
            rating: pickNumber(item, ["averageRating", "rating", "score"]),
        }))
        .slice(0, 5);
}

function normalizeSeries(source: unknown, labelFallbackPrefix: string, valueKeys: string[]): SeriesPoint[] {
    const items = extractArray(source, ["series", "data", "items", "rows", "records", "points"]);

    if (items.length > 0) {
        return items
            .map((item, index) => {
                if (typeof item === "number") {
                    return { label: `${labelFallbackPrefix} ${index + 1}`, value: item };
                }

                if (typeof item === "string") {
                    const numericValue = parseNumber(item);

                    if (numericValue !== undefined) {
                        return { label: `${labelFallbackPrefix} ${index + 1}`, value: numericValue };
                    }
                }

                if (isRecord(item)) {
                    const label = shortenLabel(
                        pickString(item, ["label", "month", "date", "day", "name"], `${labelFallbackPrefix} ${index + 1}`),
                        `${labelFallbackPrefix} ${index + 1}`
                    );
                    const value = pickNumber(item, valueKeys);

                    return { label, value };
                }

                return null;
            })
            .filter((item): item is SeriesPoint => Boolean(item));
    }

    if (isRecord(source)) {
        const points = Object.entries(source)
            .map(([label, value]) => {
                const numericValue = parseNumber(value);

                if (numericValue === undefined) {
                    return null;
                }

                return {
                    label: shortenLabel(label, labelFallbackPrefix),
                    value: numericValue,
                };
            })
            .filter((item): item is SeriesPoint => Boolean(item));

        if (points.length > 0) {
            return points;
        }
    }

    return [];
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    const normalized = status.toLowerCase();

    if (normalized.includes("approved") || normalized.includes("active") || normalized.includes("paid") || normalized.includes("success")) {
        return "default";
    }

    if (normalized.includes("pending") || normalized.includes("review") || normalized.includes("processing")) {
        return "secondary";
    }

    if (normalized.includes("reject") || normalized.includes("block") || normalized.includes("fail") || normalized.includes("delete")) {
        return "destructive";
    }

    return "outline";
}

function EmptyBlock({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-semibold text-slate-700">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>
    );
}

export default async function AdminDashboardPage() {
    const requests = await Promise.allSettled([
        getAdminDashboardStats(),
        getAdminDashboardUsers(),
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

    const [
        statsResult,
        usersResult,
        moviesResult,
        reviewsResult,
        commentsResult,
        contributionsResult,
        paymentsResult,
        revenueStatsResult,
        subscriptionsResult,
        topMoviesResult,
        watchlistCountsResult,
        reviewsGrowthResult,
    ] = requests;

    const stats = getSuccessData(statsResult, {});
    const users = normalizeUsers(getSuccessData(usersResult, []));
    const movies = normalizeMovies(getSuccessData(moviesResult, []));
    const pendingReviews = normalizeReviews(getSuccessData(reviewsResult, []));
    const comments = extractArray(getSuccessData(commentsResult, []), ["comments", "items", "rows", "records"]);
    const contributions = normalizeContributions(getSuccessData(contributionsResult, []));
    const payments = normalizePayments(getSuccessData(paymentsResult, []));
    const revenueStats = getSuccessData(revenueStatsResult, {});
    const subscriptions = extractArray(getSuccessData(subscriptionsResult, []), ["subscriptions", "items", "rows", "records"]);
    const topWatchlistMovies = normalizeTopMovies(getSuccessData(topMoviesResult, []));
    const watchlistCounts = getSuccessData(watchlistCountsResult, {});
    const reviewsPerDay = normalizeSeries(getSuccessData(reviewsGrowthResult, []), "D", ["count", "reviews", "total", "value"]);

    const totalUsers = pickNumber(stats, ["totalUsers", "userCount", "users", "totalUserCount"], users.length);
    const totalMovies = pickNumber(stats, ["totalMovies", "movieCount", "movies", "totalMovieCount"], movies.length);
    const reviewQueue = pickNumber(stats, ["pendingReviews", "reviewQueue", "totalPendingReviews"], pendingReviews.length);
    const totalRevenue = pickNumber(revenueStats, ["totalRevenue", "revenue", "lifetimeRevenue", "grossRevenue"]);
    const activeSubscriptionsFromList = subscriptions.filter((item) => pickString(item, ["status", "subscriptionStatus"], "").toLowerCase().includes("active")).length;
    const activeSubscriptions = activeSubscriptionsFromList || pickNumber(stats, ["activeSubscriptions", "subscriptions", "totalSubscriptions"], subscriptions.length);
    const watchlistEntries = pickNumber(watchlistCounts, ["total", "totalWatchlists", "watchlistCount", "totalWatchlistEntries"], topWatchlistMovies.reduce((sum, movie) => sum + movie.count, 0));
    const failedFeeds = requests.length - countFulfilled(requests);
    const activeUsersCount = users.filter((user) => user.status.toLowerCase().includes("active")).length;
    const studentUsers = users.filter((user) => user.role.toLowerCase().includes("user")).length;
    const adminUsers = users.filter((user) => user.role.toLowerCase().includes("admin")).length;
    const paidPaymentsCount = payments.filter((payment) => payment.status.toLowerCase().includes("success") || payment.status.toLowerCase().includes("paid")).length;
    const pendingPaymentsCount = payments.filter((payment) => payment.status.toLowerCase().includes("pending") || payment.status.toLowerCase().includes("process")).length;
    const failedPaymentsCount = payments.filter((payment) => payment.status.toLowerCase().includes("fail") || payment.status.toLowerCase().includes("reject")).length;
    const pendingCount = pendingReviews.filter((review) => review.status.toLowerCase().includes("pending")).length + contributions.filter((item) => item.status.toLowerCase().includes("pending")).length;
    const approvedCount = pendingReviews.filter((review) => review.status.toLowerCase().includes("approved")).length + contributions.filter((item) => item.status.toLowerCase().includes("approved")).length;
    const rejectedCount = pendingReviews.filter((review) => review.status.toLowerCase().includes("reject")).length + contributions.filter((item) => item.status.toLowerCase().includes("reject")).length;

    const trendPoints = reviewsPerDay.slice(-30);
    const todayCount = trendPoints.at(-1)?.value ?? 0;
    const yesterdayCount = trendPoints.at(-2)?.value ?? 0;
    const weekCount = trendPoints.slice(-7).reduce((sum, point) => sum + point.value, 0);
    const previousWeekCount = trendPoints.slice(-14, -7).reduce((sum, point) => sum + point.value, 0);
    const monthCount = trendPoints.reduce((sum, point) => sum + point.value, 0);
    const revenueInThousands = totalRevenue > 0 ? `${(totalRevenue / 1000).toFixed(1)}k` : "0k";
    const healthPercent = requests.length > 0 ? Math.round((countFulfilled(requests) / requests.length) * 100) : 0;
    const topMovieTitle = topWatchlistMovies[0]?.title ?? "No watchlist data";

    const todayDelta = todayCount - yesterdayCount;
    const weekDelta = weekCount - previousWeekCount;

    const todayDeltaText = `${todayDelta >= 0 ? "+" : ""}${todayDelta} from yesterday`;
    const weekDeltaText = `${weekDelta >= 0 ? "+" : ""}${weekDelta} from last week`;
    const trendChartData = trendPoints.length > 0 ? trendPoints : [{ label: "No data", value: 0 }];

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/dashboard" />

                <div className="min-w-0">
                    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200/80 bg-slate-50/95 px-4 backdrop-blur sm:px-6">
                        <div>
                            <p className="text-sm font-semibold tracking-wide text-slate-800">Admin Console</p>
                            <p className="text-xs text-slate-500">Operational overview</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm md:flex">
                                <Search className="size-4" />
                                Search
                            </div>
                            <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-slate-700">
                                <Bell className="size-4" />
                            </button>
                            <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-slate-700">
                                <Home className="size-4" />
                            </button>
                        </div>
                    </header>

                    <main className="bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_42%),radial-gradient(circle_at_top_left,rgba(2,132,199,0.08),transparent_36%)] p-4 sm:p-6">
                        <div className="mx-auto max-w-6xl space-y-5">
                            <section className="rounded-2xl border border-slate-200/80 bg-white px-6 py-6 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Admin Dashboard</h1>
                                        <p className="mt-2 text-sm text-slate-600">Welcome back! Here is what is happening with your platform.</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-right">
                                        <p className="text-xs uppercase tracking-wide text-slate-500">Feed Health</p>
                                        <p className="text-lg font-semibold text-slate-900">{countFulfilled(requests)}/{requests.length}</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                                    <span className="inline-flex size-2 rounded-full bg-emerald-500" />
                                    Last updated: Just now
                                </div>
                            </section>

                            <section className="grid gap-4 xl:grid-cols-3">
                                <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                                            <Users className="size-5" />
                                        </div>
                                        <Badge variant="secondary">+{Math.max(activeUsersCount, 0)}%</Badge>
                                    </div>
                                    <p className="mt-4 text-sm text-slate-500">Total Users</p>
                                    <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900">{formatNumber(totalUsers)}</p>
                                    <p className="mt-3 text-sm text-slate-500">
                                        <span className="text-violet-500">•</span> Students: {formatNumber(studentUsers)}
                                        <span className="ml-3 text-orange-500">•</span> Admin: {formatNumber(adminUsers)}
                                    </p>
                                    <div className="mt-4 h-2 rounded-full bg-slate-100">
                                        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.min(healthPercent + 15, 100)}%` }} />
                                    </div>
                                </article>

                                <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                                            <CalendarCheck2 className="size-5" />
                                        </div>
                                        <Badge variant="secondary">+8.2%</Badge>
                                    </div>
                                    <p className="mt-4 text-sm text-slate-500">Total Movies</p>
                                    <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900">{formatNumber(totalMovies)}</p>
                                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-500">
                                        <p>
                                            Active
                                            <span className="mt-0.5 block font-semibold text-slate-800">{formatNumber(activeSubscriptions)}</span>
                                        </p>
                                        <p>
                                            Watchlists
                                            <span className="mt-0.5 block font-semibold text-slate-800">{formatNumber(watchlistEntries)}</span>
                                        </p>
                                    </div>
                                    <div className="mt-4 h-2 rounded-full bg-slate-100">
                                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min((watchlistEntries / Math.max(totalMovies, 1)) * 100, 100)}%` }} />
                                    </div>
                                </article>

                                <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div className="rounded-xl bg-orange-50 p-2.5 text-orange-600">
                                            <Activity className="size-5" />
                                        </div>
                                        <Badge variant={failedFeeds > 0 ? "destructive" : "secondary"}>{failedFeeds > 0 ? `${failedFeeds} feeds down` : "0%"}</Badge>
                                    </div>
                                    <p className="mt-4 text-sm text-slate-500">Platform Health</p>
                                    <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900">{formatNumber(countFulfilled(requests))}</p>
                                    <p className="mt-2 text-sm text-slate-500">Active feeds</p>
                                    <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
                                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${healthPercent}%` }} />
                                    </div>
                                    <p className="mt-2 text-right text-xs text-slate-500">Completion Rate: {healthPercent}%</p>
                                </article>
                            </section>

                            <section className="grid gap-4 xl:grid-cols-3">
                                <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                    <h3 className="text-xl font-semibold tracking-tight text-slate-900">Verification Summary</h3>
                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                                            <div>
                                                <p className="text-sm text-slate-600">Verified</p>
                                                <p className="text-2xl font-semibold text-slate-900">{formatNumber(approvedCount)}</p>
                                            </div>
                                            <CheckCircle2 className="size-5 text-emerald-500" />
                                        </div>
                                        <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5">
                                            <div>
                                                <p className="text-sm text-slate-600">Pending</p>
                                                <p className="text-2xl font-semibold text-slate-900">{formatNumber(pendingCount || reviewQueue)}</p>
                                            </div>
                                            <CircleDashed className="size-5 text-amber-500" />
                                        </div>
                                        <div className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5">
                                            <div>
                                                <p className="text-sm text-slate-600">Rejected</p>
                                                <p className="text-2xl font-semibold text-slate-900">{formatNumber(rejectedCount)}</p>
                                            </div>
                                            <CircleAlert className="size-5 text-rose-500" />
                                        </div>
                                    </div>
                                </article>

                                <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                    <h3 className="text-xl font-semibold tracking-tight text-slate-900">Booking Trends</h3>
                                    <div className="mt-4 space-y-3">
                                        <div className="rounded-xl bg-blue-50 px-3 py-2.5">
                                            <p className="text-sm text-slate-600">Today</p>
                                            <p className="text-3xl font-semibold text-slate-900">{formatNumber(todayCount)}</p>
                                            <p className="text-xs text-slate-500">{todayDeltaText}</p>
                                        </div>
                                        <div className="rounded-xl bg-emerald-50 px-3 py-2.5">
                                            <p className="text-sm text-slate-600">This Week</p>
                                            <p className="text-3xl font-semibold text-slate-900">{formatNumber(weekCount)}</p>
                                            <p className="text-xs text-slate-500">{weekDeltaText}</p>
                                        </div>
                                        <div className="rounded-xl bg-violet-50 px-3 py-2.5">
                                            <p className="text-sm text-slate-600">This Month</p>
                                            <p className="text-3xl font-semibold text-slate-900">{formatNumber(monthCount)}</p>
                                            <p className="text-xs text-slate-500">Top title: {topMovieTitle}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <SparklineChart points={trendChartData.slice(-14)} />
                                    </div>
                                </article>

                                <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                    <h3 className="text-xl font-semibold tracking-tight text-slate-900">Quick Stats</h3>
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center">
                                            <p className="text-3xl font-semibold text-blue-500">{formatNumber(activeUsersCount)}</p>
                                            <p className="mt-1 text-sm text-slate-500">Active Users</p>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center">
                                            <p className="text-3xl font-semibold text-emerald-500">{formatNumber(paidPaymentsCount)}</p>
                                            <p className="mt-1 text-sm text-slate-500">Completed</p>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center">
                                            <p className="text-3xl font-semibold text-orange-500">{formatNumber(totalMovies)}</p>
                                            <p className="mt-1 text-sm text-slate-500">Movies</p>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center">
                                            <p className="text-3xl font-semibold text-violet-500">{revenueInThousands}</p>
                                            <p className="mt-1 text-sm text-slate-500">Revenue (K)</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-slate-700">Weekly Direction</p>
                                            <span className={`inline-flex items-center gap-1 text-sm font-semibold ${weekDelta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                                <TrendingUp className="size-4" />
                                                {weekDelta >= 0 ? "+" : ""}{weekDelta}
                                            </span>
                                        </div>
                                        <div className="mt-2 h-2 rounded-full bg-slate-200">
                                            <div
                                                className={`h-2 rounded-full ${weekDelta >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                                                style={{ width: `${Math.min(Math.abs(weekDelta) * 8 + 15, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </article>
                            </section>

                            <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                                <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-xl font-semibold tracking-tight text-slate-900">Activity Graph</h3>
                                            <p className="mt-1 text-sm text-slate-500">Daily review-volume trend from your analytics feed.</p>
                                        </div>
                                        <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                                            <BarChart3 className="size-5" />
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <SparklineChart points={trendChartData} stroke="#0f766e" />
                                    </div>

                                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 py-2">
                                            <p className="text-xs text-slate-500">Today</p>
                                            <p className="text-lg font-semibold text-slate-900">{formatNumber(todayCount)}</p>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 py-2">
                                            <p className="text-xs text-slate-500">This Week</p>
                                            <p className="text-lg font-semibold text-slate-900">{formatNumber(weekCount)}</p>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 py-2">
                                            <p className="text-xs text-slate-500">This Month</p>
                                            <p className="text-lg font-semibold text-slate-900">{formatNumber(monthCount)}</p>
                                        </div>
                                    </div>
                                </article>

                                <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                    <h3 className="text-xl font-semibold tracking-tight text-slate-900">Payment Distribution</h3>
                                    <p className="mt-1 text-sm text-slate-500">Breakdown of payment statuses.</p>

                                    <div className="mt-5 flex items-center justify-center">
                                        <DonutChart
                                            value={paidPaymentsCount}
                                            total={Math.max(payments.length, 1)}
                                            color="#16a34a"
                                        />
                                    </div>

                                    <div className="mt-5 space-y-2 text-sm">
                                        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                                            <span className="text-slate-600">Paid</span>
                                            <span className="font-semibold text-emerald-600">{formatNumber(paidPaymentsCount)}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                                            <span className="text-slate-600">Pending</span>
                                            <span className="font-semibold text-amber-600">{formatNumber(pendingPaymentsCount)}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                                            <span className="text-slate-600">Failed</span>
                                            <span className="font-semibold text-rose-600">{formatNumber(failedPaymentsCount)}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                            <span className="text-slate-700">Total</span>
                                            <span className="font-semibold text-slate-900">{formatNumber(payments.length)}</span>
                                        </div>
                                    </div>
                                </article>
                            </section>

                            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-2xl font-semibold text-slate-900">Users</h3>
                                        <p className="text-sm text-slate-500">Total {formatNumber(totalUsers)} registered users</p>
                                    </div>
                                    <p className="text-sm text-slate-500">Page 1 of 4</p>
                                </div>

                                <Separator className="my-4" />

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-160 text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-slate-500">
                                                <th className="py-2 pr-4 font-medium">Name</th>
                                                <th className="py-2 pr-4 font-medium">Email</th>
                                                <th className="py-2 pr-4 font-medium">Role</th>
                                                <th className="py-2 pr-4 font-medium">Status</th>
                                                <th className="py-2 font-medium">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.length === 0 ? (
                                                <tr>
                                                    <td className="py-6" colSpan={5}>
                                                        <EmptyBlock
                                                            title="No user data returned"
                                                            description="The table is connected to the admin users endpoint and will fill when backend data is available."
                                                        />
                                                    </td>
                                                </tr>
                                            ) : (
                                                users.map((user) => (
                                                    <tr key={user.id} className="border-b border-slate-100 transition hover:bg-slate-50 last:border-b-0">
                                                        <td className="py-3 pr-4 font-medium text-slate-800">{user.name}</td>
                                                        <td className="py-3 pr-4 text-slate-600">{user.email}</td>
                                                        <td className="py-3 pr-4">
                                                            <Badge variant="outline">{user.role}</Badge>
                                                        </td>
                                                        <td className="py-3 pr-4">
                                                            <Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
                                                        </td>
                                                        <td className="py-3 text-slate-600">{user.joinedAt}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section className="grid gap-4 md:grid-cols-2">
                                <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                    <h3 className="text-lg font-semibold text-slate-900">Moderation Queue</h3>
                                    <p className="mt-1 text-sm text-slate-500">Pending review and contribution records</p>
                                    <p className="mt-4 text-3xl font-semibold text-slate-900">{formatNumber(pendingCount || reviewQueue)}</p>
                                    <p className="mt-2 text-sm text-slate-500">Reviews: {pendingReviews.length}, Contributions: {contributions.length}, Comments: {comments.length}</p>
                                </article>

                                <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                    <h3 className="text-lg font-semibold text-slate-900">Revenue Snapshot</h3>
                                    <p className="mt-1 text-sm text-slate-500">Payments and subscriptions status</p>
                                    <p className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(totalRevenue)}</p>
                                    <p className="mt-2 text-sm text-slate-500">{formatNumber(paidPaymentsCount)} paid payments • {formatNumber(activeSubscriptions)} active subscriptions</p>
                                </article>
                            </section>

                            <div className="flex items-center justify-end">
                                <Link
                                    href="/admin/dashboard"
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                                >
                                    Refresh Dashboard
                                </Link>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

function SparklineChart({
    points,
    stroke = "#2563eb",
}: {
    points: Array<{ label: string; value: number }>;
    stroke?: string;
}) {
    const width = 520;
    const height = 160;
    const padding = 16;

    const safePoints = points.length > 1 ? points : [{ label: "A", value: 0 }, { label: "B", value: points[0]?.value ?? 0 }];
    const minValue = Math.min(...safePoints.map((point) => point.value));
    const maxValue = Math.max(...safePoints.map((point) => point.value));
    const range = Math.max(maxValue - minValue, 1);

    const polylinePoints = safePoints
        .map((point, index) => {
            const x = padding + (index * (width - padding * 2)) / Math.max(safePoints.length - 1, 1);
            const normalized = (point.value - minValue) / range;
            const y = height - padding - normalized * (height - padding * 2);
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full">
            <defs>
                <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <polyline
                fill="none"
                stroke={stroke}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
            />
            <polygon
                fill="url(#trendFill)"
                points={`${padding},${height - padding} ${polylinePoints} ${width - padding},${height - padding}`}
            />
        </svg>
    );
}

function DonutChart({
    value,
    total,
    color,
}: {
    value: number;
    total: number;
    color: string;
}) {
    const safeTotal = Math.max(total, 1);
    const angle = Math.round((value / safeTotal) * 360);

    return (
        <div className="relative flex size-28 items-center justify-center rounded-full bg-slate-100"
            style={{
                background: `conic-gradient(${color} ${angle}deg, #e2e8f0 ${angle}deg)`,
            }}
        >
            <div className="flex size-20 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700">
                {Math.round((value / safeTotal) * 100)}%
            </div>
        </div>
    );
}