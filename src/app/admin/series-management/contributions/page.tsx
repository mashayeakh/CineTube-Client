import Link from "next/link";
import { ClipboardCheck, Home, Search } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAllAdminSeries } from "@/service/admin-series.services";

export default async function AdminSeriesContributionsPage() {
    const allSeries = await getAllAdminSeries().catch(() => ({ data: [] as unknown[] }));

    const count = Array.isArray(allSeries.data) ? allSeries.data.length : 0;

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/series-management/contributions" />

                <div className="min-w-0">
                    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Series Management</p>
                            <p className="text-xs text-slate-500">Contributions</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500 md:flex">
                                <Search className="size-4" />
                                Search
                            </div>
                            <Link href="/admin/dashboard" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-700">
                                <Home className="size-4" />
                            </Link>
                        </div>
                    </header>

                    <main className="p-4 sm:p-6">
                        <div className="mx-auto max-w-5xl space-y-5">
                            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight text-slate-900">
                                    <ClipboardCheck className="size-7 text-blue-600" />
                                    Contributions
                                </h1>
                                <p className="mt-2 text-sm text-slate-600">
                                    Series contribution APIs were not included in your provided routes. This page is now connected in sidebar and ready to bind once contribution endpoints are added.
                                </p>
                                <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                    Current series count from /series: {count}
                                </p>
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
