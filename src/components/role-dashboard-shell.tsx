"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown, LayoutDashboard, Shield, Sparkles, UserCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

type UserRole = "USER" | "ADMIN" | "PREMIUM_USER";

type RoleDashboardShellProps = {
    role: UserRole;
    children: React.ReactNode;
};

const roleConfig = {
    USER: {
        label: "User",
        icon: UserCircle2,
        dashboardHref: "/user/dashboard",
        accent: "from-sky-500 via-cyan-500 to-emerald-500",
        description: "Personal dashboard for regular users.",
    },
    ADMIN: {
        label: "Admin",
        icon: Shield,
        dashboardHref: "/admin/dashboard",
        accent: "from-rose-500 via-orange-500 to-amber-500",
        description: "Operations dashboard for administrative users.",
    },
    PREMIUM_USER: {
        label: "Premium user",
        icon: Crown,
        dashboardHref: "/premium_user/dashboard",
        accent: "from-violet-500 via-fuchsia-500 to-pink-500",
        description: "Premium experience dashboard for subscribed members.",
    },
} as const;

export function RoleDashboardShell({ role, children }: RoleDashboardShellProps) {
    const pathname = usePathname();
    const config = roleConfig[role];
    const RoleIcon = config.icon;

    const navItems = [
        {
            href: config.dashboardHref,
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            href: "/my-profile",
            label: "My profile",
            icon: UserCircle2,
        },
        {
            href: "/change-password",
            label: "Change password",
            icon: Sparkles,
        },
    ];

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.16),transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_50%,#111827_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                    <div className={cn("rounded-2xl bg-gradient-to-r p-[1px]", config.accent)}>
                        <div className="rounded-2xl bg-slate-950/90 p-5">
                            <div className="flex items-center gap-3">
                                <span className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
                                    <RoleIcon className="size-5" />
                                </span>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Protected</p>
                                    <h2 className="text-xl font-semibold text-white">{config.label} area</h2>
                                </div>
                            </div>
                            <p className="mt-4 text-sm leading-6 text-slate-300">{config.description}</p>
                        </div>
                    </div>

                    <nav className="mt-6 space-y-2">
                        {navItems.map((item) => {
                            const ItemIcon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                                        isActive
                                            ? "border-white/20 bg-white/12 text-white"
                                            : "border-white/5 bg-white/[0.03] text-slate-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                                    )}
                                >
                                    <ItemIcon className="size-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}