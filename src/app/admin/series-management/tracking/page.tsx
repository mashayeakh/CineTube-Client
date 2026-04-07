import Link from "next/link";
import { Home, Search } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getMySeriesTracking } from "@/service/admin-series.services";

type UnknownRecord = Record<string, unknown>;

type TrackingRow = {
    id: string;
    seriesTitle: string;
    progress: string;
    status: string;
    updatedAt: string;
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

function normalizeTracking(raw: unknown): TrackingRow[] {
    const list = extractArray(raw, ["tracking", "items", "result", "data", "rows", "records"]);

    return list
        .map((item, index) => {
            const seriesObject = isRecord(item) ? (item.series ?? item.show) : null;

            return {
                id: pickString(item, ["id", "_id", "trackingId"], `tracking-${index + 1}`),
                seriesTitle: pickString(seriesObject, ["title", "name"], pickString(item, ["seriesTitle", "title"], "Unknown series")),
                progress: pickString(item, ["progress", "episodeProgress", "watchedEpisodes"], "-"),
                status: pickString(item, ["status", "watchStatus", "state"], "ACTIVE").toUpperCase(),
                updatedAt: pickString(item, ["updatedAt", "createdAt"], "-"),
            };
        })
        .filter((item) => Boolean(item.id));
}

export default async function AdminSeriesTrackingPage() {
    const result = await getMySeriesTracking().catch(() => ({ data: [] as unknown[] }));
    const rows = normalizeTracking(result.data);

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/series-management/tracking" />

                <div className="min-w-0">
                    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Series Management</p>
                            <p className="text-xs text-slate-500">Tracking</p>
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
                                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Tracking</h1>
                                <p className="mt-2 text-sm text-slate-600">Data source: /series/tracking/me</p>
                            </section>

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                {rows.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-slate-500">No tracking records found.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                                                <tr>
                                                    <th className="px-4 py-3">Series</th>
                                                    <th className="px-4 py-3">Progress</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3">Updated</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {rows.map((row) => (
                                                    <tr key={row.id}>
                                                        <td className="px-4 py-3 font-medium text-slate-900">{row.seriesTitle}</td>
                                                        <td className="px-4 py-3 text-slate-700">{row.progress}</td>
                                                        <td className="px-4 py-3 text-slate-700">{row.status}</td>
                                                        <td className="px-4 py-3 text-slate-700">{row.updatedAt}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
