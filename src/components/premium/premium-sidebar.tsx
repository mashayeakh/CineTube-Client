"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    ChevronDown,
    ChevronRight,
    CircleUserRound,
    Crown,
    Film,
    History,
    LayoutDashboard,
    ListVideo,
    LogOut,
    MessageCircle,
    ReceiptText,
    Star,
    Subtitles,
    Tv,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

type PremiumSidebarProps = {
    activePath: string;
};

const navItems = [
    { label: "Dashboard", href: "/premium_user/dashboard", icon: LayoutDashboard },
    { label: "My Profile", href: "/premium_user/profile", icon: CircleUserRound },
    // { label: "Overview", href: "/premium_user/overview", icon: Compass },
    { label: "My Watchlist", href: "/premium_user/watchlist", icon: ListVideo },
    { label: "My Reviews", href: "/premium_user/reviews", icon: Star },
    { label: "My Comments", href: "/premium_user/comments", icon: MessageCircle },
    { label: "My Subscription", href: "/premium_user/subscription", icon: Subtitles },
    { label: "Payment History", href: "/premium_user/payment-history", icon: History },
];

const CONTRIBUTION_PATHS = [
    "/premium_user/contributions",
    "/premium_user/series-contributions",
    "/user/contributions",
    "/user/series-contributions",
];

export function PremiumSidebar({ activePath }: PremiumSidebarProps) {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const isContributionActive = CONTRIBUTION_PATHS.some(
        (path) => activePath === path || activePath.startsWith(`${path}/`)
    );
    const [contributionsOpen, setContributionsOpen] = useState(isContributionActive);

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            await fetch("/api/logout", {
                method: "POST",
                credentials: "include",
                cache: "no-store",
            });
        } finally {
            router.push("/login");
            router.refresh();
            setIsLoggingOut(false);
        }
    };

    return (
        <aside className="border-r border-slate-200 bg-slate-50 lg:sticky lg:top-0 lg:h-screen">
            <div className="px-4 py-5">
                <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-800">
                    <Crown className="size-5 text-fuchsia-600" />
                    Premium Dashboard
                </h2>
            </div>

            <nav className="space-y-1 px-2 pb-6">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePath === item.href || activePath.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${isActive
                                ? "bg-fuchsia-50 text-fuchsia-700"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                        >
                            <Icon className="size-4" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}

                <div>
                    <button
                        type="button"
                        onClick={() => setContributionsOpen((prev) => !prev)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${isContributionActive
                            ? "bg-fuchsia-50 text-fuchsia-700"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                    >
                        <ReceiptText className="size-4" />
                        <span className="flex-1">Contributions</span>
                        {contributionsOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </button>

                    {contributionsOpen && (
                        <div className="ml-7 mt-0.5 space-y-0.5 border-l border-slate-200 pl-3">
                            {[
                                { label: "Contribution History", href: "/premium_user/contributions", icon: ReceiptText },
                                { label: "Movie Contribution", href: "/user/contributions", icon: Film },
                                { label: "Series Contribution", href: "/premium_user/series-contributions", icon: Tv },
                            ].map((sub) => {
                                const SubIcon = sub.icon;
                                const isActive = activePath === sub.href || activePath.startsWith(`${sub.href}/`);

                                return (
                                    <Link
                                        key={sub.href}
                                        href={sub.href}
                                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${isActive
                                            ? "bg-fuchsia-50 text-fuchsia-700"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                            }`}
                                    >
                                        <SubIcon className="size-3.5" />
                                        <span>{sub.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isLoggingOut ? <Spinner className="size-4" /> : <LogOut className="size-4" />}
                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </button>
            </nav>
        </aside>
    );
}