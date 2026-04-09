import Link from "next/link";
import { ChevronDown, ClipboardCheck, Clapperboard, Compass, CreditCard, LayoutDashboard, LogOut, MessageSquareText, PlusCircle, Star, Tags, UserRoundCog, UserCircle2 } from "lucide-react";
import { redirect } from "next/navigation";
import {
    getAdminDashboardSubscriptions,
    getAdminDashboardSubscriptionStats,
} from "@/service/admin-dashboard.services";
import { deleteCookie } from "@/lib/cookies.utils";

type AdminSidebarProps = {
    activePath: string;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickNumber(source: unknown, keys: string[], fallback = 0) {
    if (!isRecord(source)) {
        return fallback;
    }

    for (const key of keys) {
        const value = source[key];

        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }

        if (typeof value === "string") {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
    }

    return fallback;
}

function pickString(source: unknown, keys: string[], fallback = "") {
    if (!isRecord(source)) {
        return fallback;
    }

    for (const key of keys) {
        const value = source[key];

        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    return fallback;
}

function extractArray(source: unknown, keys: string[]) {
    if (Array.isArray(source)) {
        return source;
    }

    if (isRecord(source)) {
        for (const key of keys) {
            if (Array.isArray(source[key])) {
                return source[key] as unknown[];
            }
        }

        for (const value of Object.values(source)) {
            if (Array.isArray(value)) {
                return value;
            }
        }
    }

    return [] as unknown[];
}

function isPendingStatus(status: string) {
    const normalized = status.trim().toUpperCase();
    return normalized.includes("PENDING") || normalized.includes("PROCESS") || normalized.includes("REVIEW");
}

export async function AdminSidebar({ activePath }: AdminSidebarProps) {
    const isMovieOpen = activePath.startsWith("/admin/movie-management");
    const isSeriesOpen = activePath.startsWith("/admin/series-management");

    const [statsResponse, subscriptionsResponse] = await Promise.all([
        getAdminDashboardSubscriptionStats().catch(() => ({ data: {} as Record<string, unknown> })),
        getAdminDashboardSubscriptions().catch(() => ({ data: [] as unknown[] })),
    ]);

    const statsData = statsResponse?.data;
    const subscriptions = extractArray(subscriptionsResponse?.data, ["subscriptions", "items", "result", "data", "rows", "records"]);

    const pendingFromStats = pickNumber(statsData, ["pending", "pendingCount", "pendingSubscriptions"]);
    const pendingFromList = subscriptions.filter((item) => isPendingStatus(pickString(item, ["status", "subscriptionStatus"], ""))).length;
    const pendingCount = Math.max(pendingFromStats, pendingFromList);

    const hasRecentPending = pendingCount > 0;

    const logoutAction = async () => {
        "use server";

        await Promise.all([
            deleteCookie("accessToken"),
            deleteCookie("refreshToken"),
            deleteCookie("better-auth.session_token"),
        ]);

        redirect("/login");
    };

    const links = [
        { label: "Profile", href: "/admin/profile", icon: UserCircle2 },
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Subscription Management", href: "/admin/subscription-management", icon: CreditCard },
        { label: "Category Management", href: "/admin/category-management", icon: Tags },
        { label: "User Management", href: "/admin/user-management", icon: UserRoundCog },
    ];

    return (
        <aside className="border-r border-blue-200/70 bg-linear-to-b from-blue-100 via-sky-50 to-indigo-100 lg:sticky lg:top-0 lg:h-screen">
            <div className="px-4 py-5">
                <h2 className="text-xl font-semibold tracking-tight text-slate-800">My Dashboard</h2>
            </div>

            <nav className="space-y-1 px-2 pb-6">
                {links.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePath === item.href || activePath.startsWith(`${item.href}/`);
                    const isSubscriptionItem = item.href === "/admin/subscription-management";
                    const defaultClass = "text-slate-700 hover:bg-blue-100/80 hover:text-blue-900";
                    const recentPendingClass = "bg-amber-50/90 text-amber-700 hover:bg-amber-100";

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${isActive
                                ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-500/30"
                                : isSubscriptionItem && hasRecentPending
                                    ? recentPendingClass
                                    : defaultClass
                                }`}
                        >
                            <Icon className="size-4" />
                            <span className="flex-1">{item.label}</span>
                            {isSubscriptionItem && pendingCount > 0 && (
                                <span
                                    className={`inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${hasRecentPending
                                        ? "bg-amber-200 text-amber-800"
                                        : "bg-slate-200 text-slate-700"
                                        }`}
                                    aria-label={`${pendingCount} pending subscriptions`}
                                >
                                    {pendingCount}
                                </span>
                            )}
                        </Link>
                    );
                })}

                <details open={isMovieOpen} className="group">
                    <summary
                        className={`flex cursor-pointer list-none items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isMovieOpen
                            ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-500/30"
                            : "text-slate-700 hover:bg-blue-100/80 hover:text-blue-900"
                            }`}
                    >
                        <Clapperboard className="size-4" />
                        <span className="flex-1">Movie Management</span>
                        <ChevronDown className="size-4 transition group-open:rotate-180" />
                    </summary>

                    <div className="mt-1 space-y-1 pl-8">
                        {/* <Link
                            href="/admin/movie-management/create-movies"
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${activePath === "/admin/movie-management/create-movies"
                                ? "bg-blue-600 font-medium text-white shadow-md ring-1 ring-blue-500/30"
                                : "text-slate-700 hover:bg-blue-100/80 hover:text-blue-900"
                                }`}
                        >
                            <PlusCircle className="size-4" />
                            Create Movies
                        </Link> */}
                        <Link
                            href="/admin/movie-management/view-movies"
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${activePath === "/admin/movie-management/view-movies"
                                ? "bg-blue-600 font-medium text-white shadow-md ring-1 ring-blue-500/30"
                                : "text-slate-700 hover:bg-blue-100/80 hover:text-blue-900"
                                }`}
                        >
                            <Clapperboard className="size-4" />
                            View Movies
                        </Link>
                        <Link
                            href="/admin/movie-management/contributions"
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${activePath === "/admin/movie-management/contributions"
                                ? "bg-blue-600 font-medium text-white shadow-md ring-1 ring-blue-500/30"
                                : "text-slate-700 hover:bg-blue-100/80 hover:text-blue-900"
                                }`}
                        >
                            <ClipboardCheck className="size-4" />
                            Contributions
                        </Link>
                        <Link
                            href="/admin/movie-management/reviews"
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${activePath === "/admin/movie-management/reviews"
                                ? "bg-blue-50 font-medium text-blue-600"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                        >
                            <MessageSquareText className="size-4" />
                            Reviews
                        </Link>
                    </div>
                </details>
                {/* Series management */}
                <details open={isSeriesOpen} className="group">
                    <summary
                        className={`flex cursor-pointer list-none items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isSeriesOpen
                            ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-500/30"
                            : "text-slate-700 hover:bg-blue-100/80 hover:text-blue-900"
                            }`}
                    >
                        <Clapperboard className="size-4" />
                        <span className="flex-1">Series Management</span>
                        <ChevronDown className="size-4 transition group-open:rotate-180" />
                    </summary>

                    <div className="mt-1 space-y-1 pl-8">
                        <Link
                            href="/admin/series-management/create-series"
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${activePath === "/admin/series-management/create-series"
                                ? "bg-blue-600 font-medium text-white shadow-md ring-1 ring-blue-500/30"
                                : "text-slate-700 hover:bg-blue-100/80 hover:text-blue-900"
                                }`}
                        >
                            <PlusCircle className="size-4" />
                            Create Series
                        </Link>
                        <Link
                            href="/admin/series-management/all-series"
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${activePath === "/admin/series-management/all-series"
                                ? "bg-blue-600 font-medium text-white shadow-md ring-1 ring-blue-500/30"
                                : "text-slate-700 hover:bg-blue-100/80 hover:text-blue-900"
                                }`}
                        >
                            <Clapperboard className="size-4" />
                            All Series
                        </Link>
                        <Link
                            href="/admin/series-management/featured-series"
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${activePath === "/admin/series-management/featured-series"
                                ? "bg-blue-600 font-medium text-white shadow-md ring-1 ring-blue-500/30"
                                : "text-slate-700 hover:bg-blue-100/80 hover:text-blue-900"
                                }`}
                        >
                            <Star className="size-4" />
                            Featured Series
                        </Link>
                        <Link
                            href="/admin/series-management/discovery"
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${activePath === "/admin/series-management/discovery"
                                ? "bg-blue-600 font-medium text-white shadow-md ring-1 ring-blue-500/30"
                                : "text-slate-700 hover:bg-blue-100/80 hover:text-blue-900"
                                }`}
                        >
                            <Compass className="size-4" />
                            Discovery
                        </Link>
                        {/* <Link
                            href="/admin/series-management/tracking"
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${activePath === "/admin/series-management/tracking"
                                ? "bg-blue-600 font-medium text-white shadow-md ring-1 ring-blue-500/30"
                                : "text-slate-700 hover:bg-blue-100/80 hover:text-blue-900"
                                }`}
                        >
                            <Clapperboard className="size-4" />
                            Tracking
                        </Link> */}
                        <Link
                            href="/admin/series-management/contributions"
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${activePath === "/admin/series-management/contributions"
                                ? "bg-blue-600 font-medium text-white shadow-md ring-1 ring-blue-500/30"
                                : "text-slate-700 hover:bg-blue-100/80 hover:text-blue-900"
                                }`}
                        >
                            <ClipboardCheck className="size-4" />
                            Contributions
                        </Link>
                        <Link
                            href="/admin/series-management/reviews"
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${activePath === "/admin/series-management/reviews"
                                ? "bg-blue-50 font-medium text-blue-600"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                        >
                            <MessageSquareText className="size-4" />
                            Reviews
                        </Link>
                    </div>
                </details>

                <form action={logoutAction}>
                    <button
                        type="submit"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-100/80 hover:text-blue-900"
                    >
                        <LogOut className="size-4" />
                        <span>Logout</span>
                    </button>
                </form>
            </nav>
        </aside>
    );
}
