import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
    getCompletedAdminSeries,
    getOngoingAdminSeries,
    getUpcomingAdminSeries,
} from "@/service/admin-series.services";

type UnknownRecord = Record<string, unknown>;

type SeriesRow = {
    id: string;
    title: string;
    status?: string;
};

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
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

function normalizeSeriesList(raw: unknown): SeriesRow[] {
    const list = Array.isArray(raw)
        ? raw
        : isRecord(raw) && Array.isArray(raw.data)
            ? (raw.data as unknown[])
            : isRecord(raw) && isRecord(raw.result) && Array.isArray(raw.result.data)
                ? (raw.result.data as unknown[])
                : [];

    return list
        .map((item) => ({
            id: pickString(item, ["id", "_id"]),
            title: pickString(item, ["title", "name"]),
            status: pickString(item, ["status"]),
        }))
        .filter((item) => Boolean(item.id && item.title));
}

export default async function AdminSeriesDiscoveryPage() {
    const [ongoingResult, completedResult, upcomingResult] = await Promise.all([
        getOngoingAdminSeries().catch(() => ({ data: [] as unknown[] })),
        getCompletedAdminSeries().catch(() => ({ data: [] as unknown[] })),
        getUpcomingAdminSeries().catch(() => ({ data: [] as unknown[] })),
    ]);

    const ongoingRows = normalizeSeriesList(ongoingResult.data);
    const completedRows = normalizeSeriesList(completedResult.data);
    const upcomingRows = normalizeSeriesList(upcomingResult.data);

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/series-management/discovery" />

                <div className="min-w-0">
                    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Series Management</p>
                            <p className="text-xs text-slate-500">Discovery</p>
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
                        <div className="mx-auto max-w-6xl space-y-5">
                            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h1 className="mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight text-slate-900">
                                    <Compass className="size-7 text-sky-600" />
                                    Discovery
                                </h1>
                                <p className="mt-2 text-sm text-slate-600">Browse by ongoing, completed, and upcoming series.</p>
                            </section>

                            <section className="grid gap-4 md:grid-cols-3">
                                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <h2 className="text-sm font-semibold text-slate-900">Ongoing ({ongoingRows.length})</h2>
                                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                                        {ongoingRows.slice(0, 8).map((item) => (
                                            <li key={item.id}>{item.title}</li>
                                        ))}
                                        {ongoingRows.length === 0 ? <li>No ongoing series found.</li> : null}
                                    </ul>
                                </article>

                                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <h2 className="text-sm font-semibold text-slate-900">Completed ({completedRows.length})</h2>
                                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                                        {completedRows.slice(0, 8).map((item) => (
                                            <li key={item.id}>{item.title}</li>
                                        ))}
                                        {completedRows.length === 0 ? <li>No completed series found.</li> : null}
                                    </ul>
                                </article>

                                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <h2 className="text-sm font-semibold text-slate-900">Upcoming ({upcomingRows.length})</h2>
                                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                                        {upcomingRows.slice(0, 8).map((item) => (
                                            <li key={item.id}>{item.title}</li>
                                        ))}
                                        {upcomingRows.length === 0 ? <li>No upcoming series found.</li> : null}
                                    </ul>
                                </article>
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
