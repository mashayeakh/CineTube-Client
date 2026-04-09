import Link from "next/link";
import {
    CalendarClock,
    CheckCircle2,
    Compass,
    Home,
    Search,
    Sparkles,
    Tv,
} from "lucide-react";

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
    const totalSeries = ongoingRows.length + completedRows.length + upcomingRows.length;

    return (
        <div className="relative min-h-screen bg-linear-to-b from-slate-100 via-slate-100 to-sky-50 text-slate-900">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(56,189,248,0.18),transparent_45%),radial-gradient(circle_at_90%_0%,rgba(14,165,233,0.18),transparent_35%)]"
            />
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/series-management/discovery" />

                <div className="relative min-w-0">
                    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-4 backdrop-blur sm:px-6">
                        <div className="space-y-0.5">
                            <p className="text-sm font-semibold tracking-wide text-slate-800">Series Management</p>
                            <p className="text-xs text-slate-500">Discovery board</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm md:flex">
                                <Search className="size-4 text-sky-600" />
                                <span>Search</span>
                            </div>
                            <Link
                                href="/admin/dashboard"
                                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-700"
                            >
                                <Home className="size-4" />
                            </Link>
                        </div>
                    </header>

                    <main className="p-4 sm:p-6">
                        <div className="mx-auto max-w-6xl space-y-6">
                            <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-sky-200/60 blur-2xl"
                                />
                                <div className="relative flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <p className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                                            <Sparkles className="size-3.5" />
                                            Discovery
                                        </p>
                                        <h1 className="mt-3 flex items-center gap-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                                            <Compass className="size-7 text-sky-600" />
                                            Series Explorer
                                        </h1>
                                        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                                            Browse by ongoing, completed, and upcoming series to quickly monitor production flow.
                                        </p>
                                    </div>

                                    <div className="grid min-w-60 gap-2 text-sm">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
                                            <span className="font-semibold text-slate-900">Total tracked:</span> {totalSeries}
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
                                            <span className="font-semibold text-slate-900">Categories:</span> Ongoing, Completed, Upcoming
                                        </div>
                                        <Link
                                            href="/admin/series-management/all-series"
                                            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 font-medium text-white transition hover:bg-slate-800"
                                        >
                                            View all series
                                        </Link>
                                    </div>
                                </div>
                            </section>

                            <section className="grid gap-4 md:grid-cols-3">
                                <article className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center justify-between gap-2">
                                        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                            <Tv className="size-4 text-sky-600" />
                                            Ongoing ({ongoingRows.length})
                                        </h2>
                                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">Live</span>
                                    </div>
                                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                                        {ongoingRows.slice(0, 8).map((item) => (
                                            <li key={item.id} className="rounded-lg bg-sky-50 px-2.5 py-2 text-slate-700">
                                                {item.title}
                                            </li>
                                        ))}
                                        {ongoingRows.length === 0 ? (
                                            <li className="rounded-lg border border-dashed border-slate-300 px-2.5 py-2 text-slate-500">No ongoing series found.</li>
                                        ) : null}
                                    </ul>
                                </article>

                                <article className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center justify-between gap-2">
                                        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                            <CheckCircle2 className="size-4 text-emerald-600" />
                                            Completed ({completedRows.length})
                                        </h2>
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Done</span>
                                    </div>
                                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                                        {completedRows.slice(0, 8).map((item) => (
                                            <li key={item.id} className="rounded-lg bg-emerald-50 px-2.5 py-2 text-slate-700">
                                                {item.title}
                                            </li>
                                        ))}
                                        {completedRows.length === 0 ? (
                                            <li className="rounded-lg border border-dashed border-slate-300 px-2.5 py-2 text-slate-500">No completed series found.</li>
                                        ) : null}
                                    </ul>
                                </article>

                                <article className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center justify-between gap-2">
                                        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                            <CalendarClock className="size-4 text-violet-600" />
                                            Upcoming ({upcomingRows.length})
                                        </h2>
                                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">Next</span>
                                    </div>
                                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                                        {upcomingRows.slice(0, 8).map((item) => (
                                            <li key={item.id} className="rounded-lg bg-violet-50 px-2.5 py-2 text-slate-700">
                                                {item.title}
                                            </li>
                                        ))}
                                        {upcomingRows.length === 0 ? (
                                            <li className="rounded-lg border border-dashed border-slate-300 px-2.5 py-2 text-slate-500">No upcoming series found.</li>
                                        ) : null}
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
