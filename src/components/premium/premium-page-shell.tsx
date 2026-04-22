import Link from "next/link";
import { Bell, Home, Search } from "lucide-react";

import { PremiumSidebar } from "@/components/premium/premium-sidebar";

type PremiumPageShellProps = {
    activePath: string;
    title: string;
    // subtitle: string;
    children: React.ReactNode;
};

export function PremiumPageShell({ activePath, title, children }: PremiumPageShellProps) {
    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
                {/* <PremiumSidebar activePath={activePath} /> */}

                <div className="min-w-0">
                    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200/80 bg-slate-50/95 px-4 backdrop-blur sm:px-6">
                        <div>
                            <p className="text-sm font-semibold tracking-wide text-slate-800">Premium Console</p>
                            {/* <p className="text-xs text-slate-500">{subtitle}</p> */}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm md:flex">
                                <Search className="size-4" />
                                Search
                            </div>
                            {/* <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-slate-700" type="button">
                                <Bell className="size-4" />
                            </button> */}
                            <Link href="/user/dashboard" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-slate-700">
                                <Home className="size-4" />
                            </Link>
                        </div>
                    </header>

                    <main className="bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_42%),radial-gradient(circle_at_top_left,rgba(14,165,233,0.08),transparent_36%)] p-4 sm:p-6">
                        <div className="mx-auto max-w-6xl space-y-5">
                            <section className="rounded-2xl border border-slate-200/80 bg-white px-6 py-6 shadow-sm">
                                <h1 className="text-4xl font-semibold tracking-tight text-slate-900">{title}</h1>
                                {/* <p className="mt-2 text-sm text-slate-600">{subtitle}</p> */}
                            </section>

                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}