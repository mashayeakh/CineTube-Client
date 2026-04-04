"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

import { getSeries } from "../public/_actions/series";

const ITEMS_PER_PAGE = 12;

type Series = {
    id: string;
    title: string;
    name?: string;
    poster?: string;
    image?: string;
    releaseYear?: number;
    score?: number;
    rating?: number;
    _id?: string;
};

function SeriesGridSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                <div key={`series-skeleton-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <Skeleton className="aspect-3/4 w-full rounded-none bg-slate-200" />
                    <div className="space-y-3 p-3">
                        <Skeleton className="h-4 w-4/5 rounded-full bg-slate-200" />
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-3.5 w-12 rounded-full bg-slate-200" />
                            <Skeleton className="h-3.5 w-14 rounded-full bg-slate-200" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function PopularSeriesPage() {
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);

    const { data: rawSeries, isLoading } = useQuery({
        queryKey: ["popular-series"],
        queryFn: getSeries,
    });

    const series = useMemo(() => {
        return (Array.isArray(rawSeries) ? rawSeries : []) as Series[];
    }, [rawSeries]);

    const filteredSeries = useMemo(() => {
        const normalizedSearch = searchText.trim().toLowerCase();

        return series.filter((item) => {
            const title = (item.title || item.name || "").toLowerCase();
            return normalizedSearch.length === 0 || title.includes(normalizedSearch);
        });
    }, [series, searchText]);

    const totalPages = Math.max(1, Math.ceil(filteredSeries.length / ITEMS_PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const paginatedSeries = filteredSeries.slice(
        (safePage - 1) * ITEMS_PER_PAGE,
        safePage * ITEMS_PER_PAGE
    );

    return (
        <main className="min-h-screen bg-white px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <header className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h1 className="text-3xl font-semibold">Popular Series</h1>
                    <p className="mt-2 text-sm text-slate-600">Discover trending TV series and shows.</p>
                </header>

                {/* Search */}
                <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search by series title"
                            className="border-slate-300 bg-white pl-9 text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                </section>

                {/* Results */}
                <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-slate-600">
                            Showing {filteredSeries.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredSeries.length)} of {filteredSeries.length} series
                        </p>
                        {totalPages > 1 && (
                            <p className="text-sm text-slate-500">Page {safePage} of {totalPages}</p>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">Loading popular series</p>
                                    <p className="text-xs text-slate-500">Fetching posters and series information.</p>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Preparing catalog
                                </div>
                            </div>
                            <SeriesGridSkeleton />
                        </div>
                    ) : filteredSeries.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-16 text-center">
                            <p className="text-sm text-slate-600">No series found.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {paginatedSeries.map((item) => {
                                    const posterUrl = resolveMediaUrl(item.poster ?? item.image);
                                    const score = item.score ?? item.rating;

                                    return (
                                        <Link
                                            key={item.id}
                                            href={`/series/${item.id}`}
                                            className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
                                        >
                                            <div className="aspect-3/4 w-full bg-slate-100">
                                                {posterUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={posterUrl}
                                                        alt={item.title || item.name}
                                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-sm text-slate-500">No poster</div>
                                                )}
                                            </div>
                                            <div className="space-y-2 p-3">
                                                <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">{item.title || item.name}</h3>
                                                <div className="flex items-center justify-between text-xs text-slate-600">
                                                    <span>{item.releaseYear ?? "—"}</span>
                                                    {typeof score === "number" && (
                                                        <span className="inline-flex items-center gap-1">
                                                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                                            {score.toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={safePage === 1}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronLeft className="size-4" />
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                                        .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                                            if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                                            acc.push(p);
                                            return acc;
                                        }, [])
                                        .map((item, idx) =>
                                            item === "…" ? (
                                                <span key={`ellipsis-${idx}`} className="px-1 text-sm text-slate-400">…</span>
                                            ) : (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    onClick={() => setPage(item as number)}
                                                    className={cn(
                                                        "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition",
                                                        safePage === item
                                                            ? "border-primary bg-primary text-white"
                                                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                                                    )}
                                                >
                                                    {item}
                                                </button>
                                            )
                                        )}

                                    <button
                                        type="button"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={safePage === totalPages}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronRight className="size-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}