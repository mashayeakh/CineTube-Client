"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    CircleUserRound,
    Compass,
    Crown,
    History,
    LayoutDashboard,
    ListVideo,
    LogOut,
    MessageCircle,
    ReceiptText,
    Star,
    Subtitles,
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
    { label: "My Contributions", href: "/premium_user/contributions", icon: ReceiptText },
    { label: "My Subscription", href: "/premium_user/subscription", icon: Subtitles },
    { label: "Payment History", href: "/premium_user/payment-history", icon: History },
];

export function PremiumSidebar({ activePath }: PremiumSidebarProps) {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

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