/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Play, Star, Search, ArrowUpDown, X } from 'lucide-react'

import { getFeaturedSeries, getSeries } from '@/app/(public)/public/_actions/series'
import { getGenres } from '@/app/(public)/public/_actions/genres'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { resolveMediaUrl } from '@/lib/media'

const ITEMS_PER_PAGE = 8

type SeriesItem = {
    id: string
    title?: string
    name?: string
    poster?: string
    image?: string
    releaseYear?: number
    year?: number
    description?: string
    language?: string
    rating?: number
    score?: number
    genres?: string[]
}

function normalizeSeriesItem(input: unknown): SeriesItem | null {
    if (!input || typeof input !== 'object') {
        return null
    }

    const item = input as Record<string, unknown>
    const id = String(item.id ?? item._id ?? '')

    if (!id) {
        return null
    }

    return {
        id,
        title: typeof item.title === 'string' ? item.title : undefined,
        name: typeof item.name === 'string' ? item.name : undefined,
        poster: typeof item.poster === 'string' ? item.poster : undefined,
        image: typeof item.image === 'string' ? item.image : undefined,
        releaseYear: typeof item.releaseYear === 'number' ? item.releaseYear : undefined,
        year: typeof item.year === 'number' ? item.year : undefined,
        description: typeof item.description === 'string' ? item.description : undefined,
        language: typeof item.language === 'string' ? item.language : undefined,
        rating: typeof item.rating === 'number' ? item.rating : undefined,
        score: typeof item.score === 'number' ? item.score : undefined,
        genres: Array.isArray(item.genres) 
            ? item.genres.map((g: any) => typeof g === 'string' ? g : g.name).filter(Boolean)
            : []
    }
}

export default function SeriesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedGenre, setSelectedGenre] = useState<string>('All')
    const [currentPage, setCurrentPage] = useState(1)
    const [sortBy, setSortBy] = useState<'newest' | 'title' | 'rating'>('newest')

    const { data: genresData = [] } = useQuery({
        queryKey: ['genres'],
        queryFn: () => getGenres(),
    })

    const { data, isLoading } = useQuery({
        queryKey: ['all-series', searchQuery, sortBy, currentPage, selectedGenre],
        queryFn: async () => {
            const params: Record<string, any> = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            };

            if (searchQuery) {
                params.searchTerm = searchQuery;
            }

            if (selectedGenre !== 'All') {
                params['genres.name'] = selectedGenre;
            }

            // Sort mapping
            if (sortBy === 'title') {
                params.sortBy = 'title';
                params.sortOrder = 'asc';
            } else if (sortBy === 'rating') {
                params.sortBy = 'releaseYear'; // Proxy for rating if not available
                params.sortOrder = 'desc';
            } else {
                params.sortBy = 'createdAt';
                params.sortOrder = 'desc';
            }

            const result = await getSeries(params)

            // Handle paginated response
            if (result && typeof result === 'object' && 'data' in result) {
                return {
                    meta: result.meta,
                    items: (result.data as unknown[]).map(normalizeSeriesItem).filter((item): item is SeriesItem => item !== null)
                }
            }

            // Handle array response (legacy/fallback)
            return {
                meta: { totalPages: 1, total: Array.isArray(result) ? result.length : 0 },
                items: (Array.isArray(result) ? result : []).map(normalizeSeriesItem).filter((item): item is SeriesItem => item !== null)
            }
        },
    })

    const allSeries = data?.items ?? [];
    const meta = data?.meta as { totalPages?: number; total?: number } | undefined;
    const totalPages = meta?.totalPages ?? 1;
    const totalItems = meta?.total ?? 0;

    const { data: featuredSeries } = useQuery({
        queryKey: ['featured-series'],
        queryFn: async () => {
            const result = await getFeaturedSeries()
            return normalizeSeriesItem(result)
        },
    })

    const effectiveFeatured = useMemo(() => {
        return featuredSeries ?? allSeries[0] ?? null
    }, [featuredSeries, allSeries])

    const featuredId = effectiveFeatured?.id

    const filteredSeries = useMemo(() => {
        return allSeries
    }, [allSeries])

    const featuredRail = useMemo(() => allSeries.slice(0, 5), [allSeries])

    const safePage = Math.min(currentPage, totalPages || 1)
    const paginatedSeries = filteredSeries; // Already paginated by server

    if (isLoading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-[#030919] via-[#041335] to-[#020617] p-6 md:p-8">
                <div className="mx-auto max-w-7xl">
                    <div
                        className="mb-8 w-full rounded-3xl border border-white/10 bg-slate-900/40"
                        style={{ height: 360 }}
                    >
                        <Skeleton className="h-full w-full rounded-3xl bg-white/5" />
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <Skeleton key={index} className="h-64 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-[#030919] via-[#041335] to-[#020617] p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
                {effectiveFeatured && (
                    <section className="relative mb-10 overflow-hidden rounded-[28px] bg-linear-to-r from-fuchsia-500/35 via-sky-400/25 to-amber-300/25 p-px shadow-[0_30px_80px_rgba(2,6,23,0.45)]">
                        <div className="relative overflow-hidden rounded-[27px] bg-linear-to-br from-[#050816] via-[#09152f] to-[#130a1f]">
                            <div className="absolute inset-0">
                                <div
                                    className="absolute inset-y-4 right-4 hidden w-1/3 rounded-[26px] bg-linear-to-b from-white/10 to-white/0 p-3 shadow-[0_16px_48px_rgba(0,0,0,0.28)] sm:block"
                                    style={{ minWidth: 250, maxWidth: 380 }}
                                >
                                    <div className="relative h-full w-full overflow-hidden rounded-[22px] bg-slate-950/10">
                                        <Image
                                            src={resolveMediaUrl(effectiveFeatured.poster ?? effectiveFeatured.image)}
                                            alt={effectiveFeatured.title || effectiveFeatured.name || 'Featured series'}
                                            fill
                                            className="object-contain object-center brightness-110 saturate-125"
                                            priority
                                        />
                                    </div>
                                </div>
                                <div className="absolute inset-y-0 left-0 w-[62%] bg-linear-to-r from-[#020617]/88 via-[#071227]/72 to-transparent" />
                                <div className="absolute inset-0 bg-linear-to-t from-[#020617]/28 via-transparent to-[#0f172a]/8" />
                                <div className="absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-fuchsia-500/15 blur-3xl" />
                                <div className="absolute right-12 top-8 h-52 w-52 rounded-full bg-sky-400/12 blur-3xl" />
                            </div>

                            <div
                                className="relative z-10 flex flex-col justify-between p-6 sm:p-8 lg:p-10"
                                style={{ minHeight: 360 }}
                            >
                                <div className="max-w-2xl space-y-4 rounded-3xl bg-linear-to-br from-slate-950/32 via-slate-900/18 to-transparent p-5 backdrop-blur-[2px] sm:max-w-xl lg:bg-transparent lg:p-0 lg:backdrop-blur-0">
                                    <span className="inline-flex items-center rounded-full bg-red-600/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                                        Featured Series
                                    </span>
                                    <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                                        {effectiveFeatured.title || effectiveFeatured.name}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
                                        {(effectiveFeatured.releaseYear || effectiveFeatured.year) && (
                                            <span>{effectiveFeatured.releaseYear || effectiveFeatured.year}</span>
                                        )}
                                        {effectiveFeatured.language && <span>{effectiveFeatured.language}</span>}
                                        {typeof (effectiveFeatured.rating ?? effectiveFeatured.score) === 'number' && (
                                            <span className="inline-flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                                {(effectiveFeatured.rating ?? effectiveFeatured.score)?.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                    {effectiveFeatured.description && (
                                        <p className="line-clamp-3 max-w-xl text-sm text-slate-200 sm:text-base">
                                            {effectiveFeatured.description}
                                        </p>
                                    )}
                                    <Link href={`/series/${effectiveFeatured.id}`}>
                                        <Button className="mt-2 h-11 rounded-full bg-red-600 px-6 text-white hover:bg-red-500">
                                            <Play className="mr-2 h-4 w-4" />
                                            See more
                                        </Button>
                                    </Link>
                                </div>

                                {featuredRail.length > 0 && (
                                    <div className="mt-8 flex items-center gap-3 overflow-x-auto pb-1">
                                        {featuredRail.map((item) => (
                                            <Link
                                                key={`featured-thumb-${item.id}`}
                                                href={`/series/${item.id}`}
                                                className="group relative h-16 w-28 shrink-0 overflow-hidden rounded-xl border border-white/20"
                                            >
                                                <Image
                                                    src={resolveMediaUrl(item.poster ?? item.image)}
                                                    alt={item.title || item.name || 'Series'}
                                                    fill
                                                    className="object-cover transition duration-200 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5" />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                <div className="mb-4">
                    <h2 className="text-3xl font-bold text-white">Continue Watching</h2>
                    <p className="mt-1 text-slate-300">Discover all available series</p>
                </div>

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <Input
                            type="text"
                            placeholder="Search series by name..."
                            value={searchQuery}
                            onChange={(event) => {
                                setSearchQuery(event.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 pl-10 pr-10 text-white placeholder-slate-400 focus:bg-white/20 transition"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setCurrentPage(1);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                    </div>

                    {/* Genre Filter */}
                    <div className="relative">
                        <select
                            value={selectedGenre}
                            onChange={(e) => {
                                setSelectedGenre(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="appearance-none h-10 min-w-[140px] rounded-xl border border-white/20 bg-white/10 pl-4 pr-10 text-sm font-medium text-white shadow-sm outline-none focus:bg-white/20 transition cursor-pointer"
                        >
                            <option value="All" className="bg-[#050816]">All Genres</option>
                            {genresData.map((genre: any) => (
                                <option key={genre.id} value={genre.name} className="bg-[#050816]">
                                    {genre.name}
                                </option>
                            ))}
                        </select>
                        <ArrowUpDown className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value as any);
                                setCurrentPage(1);
                            }}
                            className="appearance-none h-10 rounded-xl border border-white/20 bg-white/10 pl-4 pr-10 text-sm font-medium text-white shadow-sm outline-none focus:bg-white/20 transition cursor-pointer"
                        >
                            <option value="newest" className="bg-[#050816]">Newest First</option>
                            <option value="title" className="bg-[#050816]">Title (A-Z)</option>
                            <option value="rating" className="bg-[#050816]">Top Rated</option>
                        </select>
                        <ArrowUpDown className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {filteredSeries.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-lg text-slate-400">No series found</p>
                    </div>
                ) : (
                    <>
                        <p className="mb-6 text-sm text-slate-400">
                            Showing <span className="font-medium text-white">
                                {Math.min((safePage - 1) * ITEMS_PER_PAGE + 1, totalItems)}-
                                {Math.min(safePage * ITEMS_PER_PAGE, totalItems)}
                            </span> of {totalItems} series
                        </p>

                        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {paginatedSeries.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/series/${item.id}`}
                                    className="group relative flex flex-col rounded-2xl bg-slate-900/50 border border-white/5 p-3 transition-all duration-300 hover:bg-slate-800/80 hover:border-white/10 hover:shadow-2xl hover:shadow-blue-500/10"
                                >
                                    <div className="relative mb-4 aspect-4/5 overflow-hidden rounded-xl bg-slate-800">
                                        <Image
                                            src={resolveMediaUrl(item.poster ?? item.image)}
                                            alt={item.title || item.name || 'Series'}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        
                                        <div className="absolute bottom-3 left-3 right-3 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white border-none h-10 rounded-lg font-semibold shadow-lg">
                                                <Play className="mr-2 size-4 fill-current" />
                                                Watch Now
                                            </Button>
                                        </div>

                                        {(item.rating || item.score) && (
                                            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-slate-950/60 px-2 py-1 text-xs font-bold text-amber-400 backdrop-blur-md border border-white/10">
                                                <Star className="size-3 fill-current" />
                                                {item.rating || item.score}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col px-1">
                                        <h3 className="mb-1 truncate text-lg font-bold text-white transition-colors group-hover:text-blue-400">
                                            {item.title || item.name}
                                        </h3>
                                        
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                                            <span>{item.releaseYear || item.year || 'N/A'}</span>
                                            {item.genres && item.genres.length > 0 && (
                                                <>
                                                    <span className="size-1 rounded-full bg-slate-600" />
                                                    <span className="truncate">{item.genres[0]}</span>
                                                </>
                                            )}
                                        </div>

                                        <p className="mt-auto line-clamp-2 text-xs leading-relaxed text-slate-500">
                                            {item.description || 'No description available for this series.'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mb-8 flex items-center justify-center gap-2">
                                <Button
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled={safePage === 1}
                                    variant="outline"
                                    className="h-10 w-10 border-white/10 bg-white/5 p-0 text-white hover:bg-white/10 disabled:opacity-30"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }).map((_, index) => {
                                        const page = index + 1
                                        if (totalPages > 5) {
                                            if (page !== 1 && page !== totalPages && Math.abs(page - safePage) > 1) {
                                                if (page === 2 || page === totalPages - 1) return <span key={page} className="text-white/30 px-1">...</span>
                                                return null
                                            }
                                        }

                                        return (
                                            <Button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`h-10 w-10 border-white/10 transition ${page === safePage
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                    : 'bg-white/5 text-white hover:bg-white/10'
                                                    }`}
                                            >
                                                {page}
                                            </Button>
                                        )
                                    })}
                                </div>

                                <Button
                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                    disabled={safePage === totalPages}
                                    variant="outline"
                                    className="h-10 w-10 border-white/10 bg-white/5 p-0 text-white hover:bg-white/10 disabled:opacity-30"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
