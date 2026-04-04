import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Home, Plus, Search } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { resolveMediaUrl } from "@/lib/media";
import { featureAdminSeries, getAdminSeries } from "@/service/admin-series.services";

type UnknownRecord = Record<string, unknown>;

type SeriesRow = {
    id: string;
    title: string;
    poster?: string;
    releaseYear?: number;
    director?: string;
    priceType?: string;
    status?: string;
    isFeatured?: boolean;
};

type PageSearchParams = {
    success?: string;
    error?: string;
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

function pickNumber(source: unknown, keys: string[]): number | undefined {
    if (!isRecord(source)) {
        return undefined;
    }

    for (const key of keys) {
        const value = source[key];
        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }
    }

    return undefined;
}

function pickBoolean(source: unknown, keys: string[]): boolean {
    if (!isRecord(source)) {
        return false;
    }

    for (const key of keys) {
        const value = source[key];
        if (typeof value === "boolean") {
            return value;
        }
    }

    return false;
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
            poster: pickString(item, ["poster", "image"]),
            releaseYear: pickNumber(item, ["releaseYear", "year"]),
            director: pickString(item, ["director"]),
            priceType: pickString(item, ["priceType"]),
            status: pickString(item, ["status"]),
            isFeatured: pickBoolean(item, ["isFeatured", "featured"]),
        }))
        .filter((item) => Boolean(item.id && item.title));
}

function buildRedirectPath(params: PageSearchParams) {
    const query = new URLSearchParams();

    if (params.success) {
        query.set("success", params.success);
    }

    if (params.error) {
        query.set("error", params.error);
    }

    const queryString = query.toString();

    return queryString
        ? `/admin/series-management/view-series?${queryString}`
        : "/admin/series-management/view-series";
}

async function featureSeriesAction(formData: FormData) {
    "use server";

    const seriesId = String(formData.get("seriesId") ?? "").trim();

    if (!seriesId) {
        redirect(buildRedirectPath({ error: "Invalid series selection." }));
    }

    try {
        await featureAdminSeries(seriesId);
        revalidatePath("/admin/series-management/view-series");
        revalidatePath("/series");
    } catch (error) {
        console.error("Failed to feature series:", error);
        redirect(buildRedirectPath({ error: "Failed to update featured series." }));
    }

    redirect(buildRedirectPath({ success: "Series featured successfully." }));
}

export default async function AdminViewSeriesPage({
    searchParams,
}: {
    searchParams: Promise<PageSearchParams>;
}) {
    const params = await searchParams;
    const result = await getAdminSeries().catch(() => ({ data: [] as unknown[] }));
    const rows = normalizeSeriesList(result.data);
    const featuredResponse = await getAdminSeries({ params: { isFeatured: true } }).catch(() => ({ data: [] as unknown[] }));
    const featuredRows = normalizeSeriesList(featuredResponse.data);
    const featuredId = featuredRows[0]?.id || rows.find((row) => row.isFeatured)?.id || "";

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/series-management/view-series" />

                <div className="min-w-0">
                    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Series Management</p>
                            <p className="text-xs text-slate-500">View Series</p>
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
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        {/* <p className="text-sm text-slate-500">Admin / Series Management / View Series</p> */}
                                        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">All Series</h1>
                                        <p className="mt-2 text-sm text-slate-600">Showing {rows.length} series from backend.</p>
                                        {params.error ? (
                                            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                                {params.error}
                                            </p>
                                        ) : null}
                                        {params.success ? (
                                            <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                                                {params.success}
                                            </p>
                                        ) : null}
                                    </div>

                                    <Link
                                        href="/admin/series-management/create-series"
                                        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                                    >
                                        <Plus className="size-4" />
                                        Create Series
                                    </Link>
                                </div>
                            </section>

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                {rows.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-slate-500">No series found.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                                                <tr>
                                                    <th className="px-4 py-3">Poster</th>
                                                    <th className="px-4 py-3">Title</th>
                                                    <th className="px-4 py-3">Year</th>
                                                    <th className="px-4 py-3">Director</th>
                                                    <th className="px-4 py-3">Type</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3">Featured</th>
                                                    <th className="px-4 py-3">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {rows.map((row) => (
                                                    <tr key={row.id}>
                                                        <td className="px-4 py-3">
                                                            {row.poster ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img
                                                                    src={resolveMediaUrl(row.poster) || row.poster}
                                                                    alt={row.title}
                                                                    className="h-14 w-10 rounded object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-slate-400">No image</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-slate-900">{row.title}</td>
                                                        <td className="px-4 py-3 text-slate-700">{row.releaseYear ?? "-"}</td>
                                                        <td className="px-4 py-3 text-slate-700">{row.director || "-"}</td>
                                                        <td className="px-4 py-3 text-slate-700">{row.priceType || "-"}</td>
                                                        <td className="px-4 py-3 text-slate-700">{row.status || "-"}</td>
                                                        <td className="px-4 py-3">
                                                            {featuredId === row.id ? (
                                                                <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                                                    Featured
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                                    Not featured
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <form action={featureSeriesAction}>
                                                                <input type="hidden" name="seriesId" value={row.id} />
                                                                <button
                                                                    type="submit"
                                                                    disabled={featuredId === row.id}
                                                                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    title={featuredId === row.id ? "This series is already featured" : "Set as featured"}
                                                                >
                                                                    {featuredId === row.id ? "Featured" : "Set Featured"}
                                                                </button>
                                                            </form>
                                                        </td>
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
