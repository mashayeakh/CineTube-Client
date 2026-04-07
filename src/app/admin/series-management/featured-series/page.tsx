import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Home, Search, Star } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { resolveMediaUrl } from "@/lib/media";
import {
    featureAdminSeries,
    getAllAdminSeries,
    getFeaturedAdminSeries,
} from "@/service/admin-series.services";

type UnknownRecord = Record<string, unknown>;

type SeriesRow = {
    id: string;
    title: string;
    poster?: string;
    releaseYear?: number;
    director?: string;
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

function extractSeriesCollection(raw: unknown): unknown[] {
    if (Array.isArray(raw)) {
        return raw;
    }

    if (isRecord(raw)) {
        if (Array.isArray(raw.data)) {
            return raw.data as unknown[];
        }

        if (isRecord(raw.result) && Array.isArray(raw.result.data)) {
            return raw.result.data as unknown[];
        }

        if (Array.isArray(raw.result)) {
            return raw.result as unknown[];
        }

        if (Array.isArray(raw.items)) {
            return raw.items as unknown[];
        }

        // The featured endpoint can return a single object.
        if (typeof raw.id === "string" || typeof raw._id === "string") {
            return [raw];
        }
    }

    return [];
}

function normalizeSeriesList(raw: unknown): SeriesRow[] {
    const list = extractSeriesCollection(raw);

    return list
        .map((item) => ({
            id: pickString(item, ["id", "_id"]),
            title: pickString(item, ["title", "name"]),
            poster: pickString(item, ["poster", "image"]),
            releaseYear: pickNumber(item, ["releaseYear", "year"]),
            director: pickString(item, ["director"]),
            isFeatured: Boolean(isRecord(item) && item.isFeatured === true),
        }))
        .filter((item) => Boolean(item.id && item.title));
}

async function setFeaturedSeriesAction(formData: FormData) {
    "use server";

    const seriesId = String(formData.get("seriesId") ?? "").trim();

    if (!seriesId) {
        redirect("/admin/series-management/featured-series?error=Invalid+series+selection");
    }

    try {
        await featureAdminSeries(seriesId);
    } catch {
        redirect("/admin/series-management/featured-series?error=Failed+to+set+featured+series");
    }

    revalidatePath("/admin/series-management/featured-series");
    revalidatePath("/admin/series-management/all-series");
    revalidatePath("/series");

    redirect("/admin/series-management/featured-series?success=Featured+series+updated");
}

export default async function AdminFeaturedSeriesPage({
    searchParams,
}: {
    searchParams: Promise<PageSearchParams>;
}) {
    const params = await searchParams;
    const featuredResult = await getFeaturedAdminSeries().catch(() => ({ data: null as unknown }));
    const allResult = await getAllAdminSeries().catch(() => ({ data: [] as unknown[] }));

    const featuredRows = normalizeSeriesList(featuredResult.data);
    const allRows = normalizeSeriesList(allResult.data);
    const featuredId = featuredRows[0]?.id ?? allRows.find((item) => item.isFeatured)?.id ?? "";

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/series-management/featured-series" />

                <div className="min-w-0">
                    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Series Management</p>
                            <p className="text-xs text-slate-500">Featured series</p>
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
                                    <Star className="size-7 text-amber-500" />
                                    Featured Series
                                </h1>
                                <p className="mt-2 text-sm text-slate-600">One featured series is allowed at a time.</p>
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
                            </section>

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                {featuredRows.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-slate-500">No featured series found.</div>
                                ) : (
                                    featuredRows.map((row) => (
                                        <article key={row.id} className="grid gap-0 md:grid-cols-[320px_minmax(0,1fr)]">
                                            <div className="aspect-16/10 bg-slate-100 md:aspect-auto">
                                                {row.poster ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={resolveMediaUrl(row.poster) || row.poster}
                                                        alt={row.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : null}
                                            </div>
                                            <div className="space-y-2 p-5">
                                                <h2 className="text-2xl font-semibold text-slate-900">{row.title}</h2>
                                                <p className="text-sm text-slate-600">{row.director || "Unknown director"}</p>
                                                <p className="text-xs text-slate-500">{row.releaseYear ?? "Year not available"}</p>
                                                <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                                    Currently Featured
                                                </span>
                                            </div>
                                        </article>
                                    ))
                                )}
                            </section>

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-200 px-4 py-3">
                                    <h2 className="text-sm font-semibold text-slate-800">Select Featured Series</h2>
                                </div>
                                {allRows.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-slate-500">No series available to feature.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                                                <tr>
                                                    <th className="px-4 py-3">Title</th>
                                                    <th className="px-4 py-3">Director</th>
                                                    <th className="px-4 py-3">Year</th>
                                                    <th className="px-4 py-3">Featured</th>
                                                    <th className="px-4 py-3">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {allRows.map((row) => {
                                                    const isCurrent = row.id === featuredId;

                                                    return (
                                                        <tr key={row.id}>
                                                            <td className="px-4 py-3 font-medium text-slate-900">{row.title}</td>
                                                            <td className="px-4 py-3 text-slate-700">{row.director || "-"}</td>
                                                            <td className="px-4 py-3 text-slate-700">{row.releaseYear ?? "-"}</td>
                                                            <td className="px-4 py-3">
                                                                {isCurrent ? (
                                                                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">Featured</span>
                                                                ) : (
                                                                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Not featured</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <form action={setFeaturedSeriesAction}>
                                                                    <input type="hidden" name="seriesId" value={row.id} />
                                                                    <button
                                                                        type="submit"
                                                                        disabled={isCurrent}
                                                                        className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    >
                                                                        {isCurrent ? "Featured" : "Set Featured"}
                                                                    </button>
                                                                </form>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
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
