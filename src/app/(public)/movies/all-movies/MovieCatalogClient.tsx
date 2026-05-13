/* eslint-disable @typescript-eslint/no-explicit-any */
// app/movies/all-movies/MovieCatalogClient.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Film, Search, Star, X, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { resolveMediaUrl } from "@/lib/media";
import type { CatalogItem } from "./page";

// ─── MovieCard ───────────────────────────────────────────────────────────────

function MovieCard({ item }: { item: CatalogItem }) {
    const posterUrl = resolveMediaUrl(item.poster);

    return (
        <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg cursor-pointer">
            <Link href={`/movies/all-movies/${item.id}`} className="block">
                <div className="relative aspect-4/5 bg-slate-100">
                    {posterUrl ? (
                        <img src={posterUrl} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-500">No poster available</div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                        <button className="rounded-full bg-blue-600 px-6 py-2 text-sm font-bold text-white shadow-xl hover:bg-blue-500 transition-transform hover:scale-105">
                            Watch Now
                        </button>
                    </div>
                </div>

                <div className="space-y-4 p-5">
                    <h3 className="line-clamp-1 text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="line-clamp-2 text-sm leading-6 text-slate-600">{item.description}</p>

                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400">Year</p>
                            <p className="mt-1 font-medium text-slate-900">{item.releaseYear ?? "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400">Access</p>
                            <p className="mt-1 font-medium text-slate-900">{item.priceType}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Director</p>
                            <p className="mt-1 line-clamp-1 font-medium text-slate-900">{item.director}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {item.genres.slice(0, 3).map((genre) => (
                            <span key={`${item.id}-${genre}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{genre}</span>
                        ))}
                        {item.platforms.slice(0, 2).map((platform) => (
                            <span key={`${item.id}-${platform}`} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">{platform}</span>
                        ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-600">
                        <span>By {item.contributorName}</span>
                        <span className="inline-flex items-center gap-1 font-medium text-slate-900">
                            <Star className="size-4 fill-amber-400 text-amber-400" />
                            {item.reviewCount} reviews
                        </span>
                    </div>
                </div>
            </Link>
        </article>
    );
}

// ─── MovieCatalogClient ───────────────────────────────────────────────────────

export function MovieCatalogClient({ items }: { items: CatalogItem[] }) {
    const [search, setSearch] = useState("");
    const [accessFilter, setAccessFilter] = useState<string>("ALL");
    const [sortBy, setSortBy] = useState<"newest" | "title" | "year" | "reviews">("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Collect unique priceType values for the filter buttons
    const accessOptions = useMemo(() => {
        const types = Array.from(new Set(items.map((i) => i.priceType.toUpperCase()))).filter(Boolean);
        return ["ALL", ...types];
    }, [items]);

    const filteredAndSorted = useMemo(() => {
        const result = items.filter((item) => {
            const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
            const matchesAccess = accessFilter === "ALL" || item.priceType.toUpperCase() === accessFilter;
            return matchesSearch && matchesAccess;
        });

        // Sorting logic
        result.sort((a, b) => {
            switch (sortBy) {
                case "title":
                    return a.title.localeCompare(b.title);
                case "year":
                    return (b.releaseYear || 0) - (a.releaseYear || 0);
                case "reviews":
                    return b.reviewCount - a.reviewCount;
                case "newest":
                default:
                    const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
                    const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
                    return bTime - aTime;
            }
        });

        return result;
    }, [items, search, accessFilter, sortBy]);

    const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAndSorted.slice(start, start + itemsPerPage);
    }, [filteredAndSorted, currentPage, itemsPerPage]);

    return (
        <section className="space-y-5">
            {/* Section header */}
            <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-950 p-3 text-white">
                    <Film className="size-5" />
                </div>
                <div>
                    <h2 className="text-2xl font-semibold text-slate-950">All Items</h2>
                    <p className="text-sm text-slate-600">Merged feed from all sources.</p>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by title…"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                    />
                    {search && (
                        <button
                            onClick={() => {
                                setSearch("");
                                setCurrentPage(1);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>

                {/* Access filter pills */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex flex-wrap gap-2">
                        {accessOptions.map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                setAccessFilter(option);
                                setCurrentPage(1);
                            }}
                                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition ${accessFilter === option
                                    ? "bg-slate-950 text-white shadow"
                                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative ml-auto">
                        <select
                            value={sortBy}
                            onChange={(e) => {
                            setSortBy(e.target.value as any);
                            setCurrentPage(1);
                        }}
                            className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-slate-900 shadow-sm outline-none focus:border-sky-400 transition cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="title">Title (A-Z)</option>
                            <option value="year">Release Year</option>
                            <option value="reviews">Most Reviews</option>
                        </select>
                        <ArrowUpDown className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Result count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    Showing <span className="font-medium text-slate-800">
                        {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSorted.length)}-
                        {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)}
                    </span> of {filteredAndSorted.length} items
                </p>
            </div>

            {/* Grid */}
            {paginatedItems.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
                    No items match your filters.
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {paginatedItems.map((item) => (
                        <MovieCard key={item.id} item={item} />
                    ))}
                </div>
            )}

            {/* ── Pagination Controls ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
                    >
                        <ChevronLeft className="size-5" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`flex h-10 w-10 items-center justify-center rounded-xl font-medium transition ${currentPage === page
                                    ? "bg-slate-950 text-white shadow-lg"
                                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
                    >
                        <ChevronRight className="size-5" />
                    </button>
                </div>
            )}
        </section>
    );
}