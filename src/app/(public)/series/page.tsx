'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Play, Star } from 'lucide-react'

import { getFeaturedSeries, getSeries } from '@/app/(public)/public/_actions/series'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { resolveMediaUrl } from '@/lib/media'

const ITEMS_PER_PAGE = 12

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
    }
}

export default function SeriesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const { data: allSeries = [], isLoading } = useQuery({
        queryKey: ['all-series'],
        queryFn: async () => {
            const result = await getSeries()
            if (!Array.isArray(result)) {
                return []
            }

            return result
                .map(normalizeSeriesItem)
                .filter((item): item is SeriesItem => item !== null)
        },
    })

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
            .filter((item) => item.id !== featuredId)
            .filter((item) => {
                const title = (item.title || item.name || '').toLowerCase()
                return title.includes(searchQuery.toLowerCase())
            })
    }, [allSeries, searchQuery, featuredId])

    const featuredRail = useMemo(() => allSeries.slice(0, 5), [allSeries])

    const totalPages = Math.ceil(filteredSeries.length / ITEMS_PER_PAGE)
    const safePage = Math.min(currentPage, totalPages || 1)
    const paginatedSeries = filteredSeries.slice(
        (safePage - 1) * ITEMS_PER_PAGE,
        safePage * ITEMS_PER_PAGE
    )

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

                <div className="mb-8">
                    <Input
                        type="text"
                        placeholder="Search series by name..."
                        value={searchQuery}
                        onChange={(event) => {
                            setSearchQuery(event.target.value)
                            setCurrentPage(1)
                        }}
                        className="max-w-md border-white/20 bg-white/10 text-white placeholder-slate-300"
                    />
                </div>

                {filteredSeries.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-lg text-slate-400">No series found</p>
                    </div>
                ) : (
                    <>
                        <p className="mb-6 text-slate-400">
                            Showing {paginatedSeries.length} of {filteredSeries.length} series
                        </p>

                        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {paginatedSeries.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/series/${item.id}`}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative mb-3 h-64 overflow-hidden rounded-lg bg-slate-800 transition-opacity duration-200 group-hover:opacity-75">
                                        <Image
                                            src={resolveMediaUrl(item.poster ?? item.image)}
                                            alt={item.title || item.name || 'Series'}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <h3 className="truncate font-semibold text-white transition-colors group-hover:text-blue-400">
                                        {item.title || item.name}
                                    </h3>
                                    {item.releaseYear || item.year ? (
                                        <p className="text-sm text-slate-400">
                                            {item.releaseYear || item.year}
                                        </p>
                                    ) : null}
                                </Link>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mb-8 flex items-center justify-center gap-4">
                                <Button
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled={safePage === 1}
                                    variant="outline"
                                    size="icon"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }).map((_, index) => {
                                        const page = index + 1
                                        const isNearCurrent = Math.abs(page - safePage) <= 1
                                        const isFirst = page === 1
                                        const isLast = page === totalPages

                                        if (!isNearCurrent && !isFirst && !isLast) {
                                            return null
                                        }

                                        return (
                                            <React.Fragment key={page}>
                                                {page > 2 && index === 0 ? (
                                                    <span className="text-slate-500">...</span>
                                                ) : null}
                                                <Button
                                                    onClick={() => setCurrentPage(page)}
                                                    variant={page === safePage ? 'default' : 'outline'}
                                                    size="sm"
                                                >
                                                    {page}
                                                </Button>
                                                {page < totalPages - 1 && isNearCurrent && index === 1 ? (
                                                    <span className="text-slate-500">...</span>
                                                ) : null}
                                            </React.Fragment>
                                        )
                                    })}
                                </div>

                                <Button
                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                    disabled={safePage === totalPages}
                                    variant="outline"
                                    size="icon"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
