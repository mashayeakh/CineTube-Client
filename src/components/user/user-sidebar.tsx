"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    CircleUserRound,
    Compass,
    Film,
    History,
    LayoutDashboard,
    ListVideo,
    LogOut,
    MessageCircle,
    Star,
    Subtitles,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

type UserSidebarProps = {
    activePath: string;
    userRole: "USER" | "PREMIUM_USER" | "ADMIN" | null;
};

const navItems = [
    { label: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
    { label: "My Profile", href: "/user/profile", icon: CircleUserRound },
    // { label: "Overview", href: "/user/overview", icon: Compass },
    { label: "My Watchlist", href: "/user/watchlist", icon: ListVideo },
    { label: "My Reviews", href: "/user/reviews", icon: Star },
    { label: "My Comments", href: "/user/comments", icon: MessageCircle },
    { label: "Movie Contribution", href: "/user/contributions", icon: Film },
    { label: "My Subscription", href: "/user/subscription", icon: Subtitles },
    { label: "Payment History", href: "/user/payment-history", icon: History },
];

export function UserSidebar({ activePath }: UserSidebarProps) {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            await fetch("/api/auth/logout", {
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
                <h2 className="text-xl font-semibold tracking-tight text-slate-800">User Dashboard</h2>
            </div>

            <nav className="space-y-1 px-2 pb-6">
                {navItems
                    .map((item) => {
                        const Icon = item.icon;
                        const isActive = activePath === item.href || activePath.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${isActive
                                    ? "bg-blue-50 text-blue-600"
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
