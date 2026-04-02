"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ClipboardCheck, Clapperboard, CreditCard, LayoutDashboard, LogOut, MessageSquareText, PlusCircle, Tags, UserRoundCog, UserCircle2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

type AdminSidebarProps = {
    activePath: string;
};

export function AdminSidebar({ activePath }: AdminSidebarProps) {
    const router = useRouter();
    const isMovieOpen = activePath.startsWith("/admin/movie-management");
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const links = [
        { label: "Profile", href: "/admin/profile", icon: UserCircle2 },
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Subscription Management", href: "/admin/subscription-management", icon: CreditCard },
        { label: "Category Management", href: "/admin/category-management", icon: Tags },
        { label: "User Management", href: "/admin/user-management", icon: UserRoundCog },
    ];

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
                <h2 className="text-xl font-semibold tracking-tight text-slate-800">My Dashboard</h2>
            </div>

            <nav className="space-y-1 px-2 pb-6">
                {links.map((item) => {
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

                <details open={isMovieOpen} className="group">
                    <summary
                        className={`flex cursor-pointer list-none items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isMovieOpen
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                    >
                        <Clapperboard className="size-4" />
                        <span className="flex-1">Movie Management</span>
                        <ChevronDown className="size-4 transition group-open:rotate-180" />
                    </summary>

                    <div className="mt-1 space-y-1 pl-8">
                        <Link
                            href="/admin/movie-management/create-movies"
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${activePath === "/admin/movie-management/create-movies"
                                ? "bg-blue-50 font-medium text-blue-600"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                        >
                            <PlusCircle className="size-4" />
                            Create Movies
                        </Link>
                        <Link
                            href="/admin/movie-management/view-movies"
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${activePath === "/admin/movie-management/view-movies"
                                ? "bg-blue-50 font-medium text-blue-600"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                        >
                            <Clapperboard className="size-4" />
                            View Movies
                        </Link>
                        <Link
                            href="/admin/movie-management/contributions"
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${activePath === "/admin/movie-management/contributions"
                                ? "bg-blue-50 font-medium text-blue-600"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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

                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isLoggingOut ? <Spinner className="size-4" /> : <LogOut className="size-4" />}
                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </button>
            </nav>
        </aside>
    );
}
