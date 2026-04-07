"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Search, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

import { getFeaturedSeries, getSeries } from "@/app/(public)/public/_actions/series";

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
    description?: string;
    language?: string;
    year?: number;
    isFeatured?: boolean;
};

function normalizeSeriesItem(input: unknown): Series | null {
    if (!input || typeof input !== "object") {
        return null;
    }

    const item = input as Record<string, unknown>;
    const id = String(item.id ?? item._id ?? "");

    if (!id) {
        return null;
    }

    return {
        id,
        title: typeof item.title === "string" ? item.title : "",
        name: typeof item.name === "string" ? item.name : undefined,
        poster: typeof item.poster === "string" ? item.poster : undefined,
        image: typeof item.image === "string" ? item.image : undefined,
        releaseYear: typeof item.releaseYear === "number" ? item.releaseYear : undefined,
        year: typeof item.year === "number" ? item.year : undefined,
        score: typeof item.score === "number" ? item.score : undefined,
        rating: typeof item.rating === "number" ? item.rating : undefined,
        description: typeof item.description === "string" ? item.description : undefined,
        language: typeof item.language === "string" ? item.language : undefined,
        isFeatured: Boolean(item.isFeatured),
    };
}

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
        queryFn: () => getSeries(),
    });

    const series = useMemo(() => {
        const list = Array.isArray(rawSeries) ? rawSeries : [];
        return list
            .map(normalizeSeriesItem)
            .filter((item): item is Series => item !== null);
    }, [rawSeries]);

    const { data: rawFeatured } = useQuery({
        queryKey: ["featured-series-popular-tv"],
        queryFn: async () => {
            const result = await getFeaturedSeries();
            return normalizeSeriesItem(result);
        },
    });

    const featuredSeries = useMemo(() => {
        return rawFeatured ?? series.find((item) => item.isFeatured) ?? series[0] ?? null;
    }, [rawFeatured, series]);

    const filteredSeries = useMemo(() => {
        const normalizedSearch = searchText.trim().toLowerCase();
        const featuredId = featuredSeries?.id;

        return series.filter((item) => {
            if (featuredId && item.id === featuredId) {
                return false;
            }

            const title = (item.title || item.name || "").toLowerCase();
            return normalizedSearch.length === 0 || title.includes(normalizedSearch);
        });
    }, [series, searchText, featuredSeries]);

    const totalPages = Math.max(1, Math.ceil(filteredSeries.length / ITEMS_PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const paginatedSeries = filteredSeries.slice(
        (safePage - 1) * ITEMS_PER_PAGE,
        safePage * ITEMS_PER_PAGE
    );

    const featuredPoster = resolveMediaUrl(featuredSeries?.poster ?? featuredSeries?.image);
    const featuredScore = featuredSeries?.score ?? featuredSeries?.rating;

    return (
        <main className="min-h-screen bg-[#0b1020] px-4 py-8 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {featuredSeries ? (
                    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
                        {featuredPoster ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={featuredPoster}
                                    alt=""
                                    aria-hidden="true"
                                    className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl saturate-125"
                                />
                            </>
                        ) : null}
                        <div className="absolute inset-0 bg-linear-to-r from-[#050913]/92 via-[#111827]/80 to-[#1e293b]/72" />
                        <div className="absolute inset-0 bg-[radial-gradient(900px_360px_at_82%_38%,rgba(148,163,184,0.22),transparent_62%),radial-gradient(860px_420px_at_14%_78%,rgba(15,23,42,0.55),transparent_66%)]" />
                        <div className="relative z-10 grid min-h-[360px] items-stretch gap-6 p-6 sm:min-h-[420px] sm:p-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:p-10">
                            <div className="flex flex-col justify-end">
                                <span className="mb-3 inline-flex w-fit rounded-full bg-red-600/95 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                                    Featured Series
                                </span>
                                <h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">
                                    {featuredSeries.title || featuredSeries.name}
                                </h1>
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-200">
                                    <span>{featuredSeries.releaseYear ?? featuredSeries.year ?? "Year unknown"}</span>
                                    {featuredSeries.language ? <span>{featuredSeries.language}</span> : null}
                                    {typeof featuredScore === "number" ? (
                                        <span className="inline-flex items-center gap-1">
                                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                            {featuredScore.toFixed(1)}
                                        </span>
                                    ) : null}
                                </div>
                                {featuredSeries.description ? (
                                    <p className="mt-3 line-clamp-3 max-w-2xl text-sm text-slate-200 sm:text-base">
                                        {featuredSeries.description}
                                    </p>
                                ) : null}
                                <div className="mt-5 flex gap-3">
                                    <Link
                                        href={`/series/${featuredSeries.id}`}
                                        className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                                    >
                                        <Play className="size-4" />
                                        Watch Now
                                    </Link>
                                </div>
                            </div>

                            {featuredPoster ? (
                                <div className="hidden overflow-hidden rounded-2xl border border-white/20 bg-black/25 shadow-[0_20px_36px_rgba(0,0,0,0.45)] lg:block">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={featuredPoster}
                                        alt={featuredSeries.title || featuredSeries.name || "Featured series"}
                                        className="h-full w-full object-cover object-center"
                                    />
                                </div>
                            ) : null}
                        </div>
                    </section>
                ) : null}

                <header className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <h2 className="text-2xl font-semibold">More Series</h2>
                    <p className="mt-2 text-sm text-slate-300">Discover and continue watching from the full catalog.</p>
                </header>

                {/* Search */}
                <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search by series title"
                            className="border-white/20 bg-white/10 pl-9 text-white placeholder:text-slate-400"
                        />
                    </div>
                </section>

                {/* Results */}
                <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-slate-300">
                            Showing {filteredSeries.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredSeries.length)} of {filteredSeries.length} series
                        </p>
                        {totalPages > 1 && (
                            <p className="text-sm text-slate-400">Page {safePage} of {totalPages}</p>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-white">Loading popular series</p>
                                    <p className="text-xs text-slate-300">Fetching posters and series information.</p>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/20">
                                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Preparing catalog
                                </div>
                            </div>
                            <SeriesGridSkeleton />
                        </div>
                    ) : filteredSeries.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-16 text-center">
                            <p className="text-sm text-slate-300">No series found.</p>
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
                                            className="group overflow-hidden rounded-xl border border-white/10 bg-black/20 transition hover:border-white/30 hover:shadow-[0_10px_26px_rgba(0,0,0,0.35)]"
                                        >
                                            <div className="aspect-3/4 w-full bg-slate-900">
                                                {posterUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={posterUrl}
                                                        alt={item.title || item.name}
                                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-sm text-slate-400">No poster</div>
                                                )}
                                            </div>
                                            <div className="space-y-2 p-3">
                                                <h3 className="line-clamp-1 text-sm font-semibold text-white">{item.title || item.name}</h3>
                                                <div className="flex items-center justify-between text-xs text-slate-300">
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
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
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
                                                            : "border-white/20 text-slate-200 hover:bg-white/10"
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
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
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