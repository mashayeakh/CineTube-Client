"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Search, Star, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

import { getGenres } from "../public/_actions/genres";
import { getPopularMovies } from "../public/_actions/popular";

const ITEMS_PER_PAGE = 12;

const SUBSCRIPTION_PRICE = {
    MONTHLY: { amount: 9.99, amountInCents: 999, label: "Monthly" },
    YEARLY: { amount: 99.99, amountInCents: 9999, label: "Yearly" }
};

type Genre = {
    id: string;
    name: string;
};

type Movie = {
    id: string;
    title: string;
    poster?: string;
    releaseYear?: number;
    score?: number;
    genre?: string;
    genres?: Array<{ id?: string; name?: string } | string>;
    genreId?: string;
};

function extractMovieGenres(movie: Movie, genresById: Map<string, string>) {
    const names = new Set<string>();

    if (typeof movie.genre === "string" && movie.genre.trim().length > 0) {
        names.add(movie.genre.trim());
    }

    if (typeof movie.genreId === "string" && genresById.has(movie.genreId)) {
        names.add(genresById.get(movie.genreId) as string);
    }

    if (Array.isArray(movie.genres)) {
        for (const item of movie.genres) {
            if (typeof item === "string" && item.trim().length > 0) {
                names.add(item.trim());
                continue;
            }

            if (item && typeof item === "object") {
                if (typeof item.name === "string" && item.name.trim().length > 0) {
                    names.add(item.name.trim());
                }

                if (typeof item.id === "string" && genresById.has(item.id)) {
                    names.add(genresById.get(item.id) as string);
                }
            }
        }
    }

    return Array.from(names);
}

function PopularGridSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                <div key={`popular-skeleton-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
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

export default function PopularPage() {
    const [searchText, setSearchText] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("all");
    const [selectedYear, setSelectedYear] = useState("all");
    const [minRating, setMinRating] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [page, setPage] = useState(1);

    const resetPage = () => setPage(1);

    const { data: rawMovies, isLoading: loadingMovies } = useQuery({
        queryKey: ["popular-page-movies"],
        queryFn: getPopularMovies,
    });

    const { data: rawGenres, isLoading: loadingGenres } = useQuery({
        queryKey: ["popular-page-genres"],
        queryFn: getGenres,
    });

    const movies = useMemo(() => {
        return (Array.isArray(rawMovies) ? rawMovies : []) as Movie[];
    }, [rawMovies]);

    const genres = useMemo(() => {
        return (Array.isArray(rawGenres) ? rawGenres : []) as Genre[];
    }, [rawGenres]);

    const genresById = useMemo(() => {
        return new Map(genres.map((genre) => [genre.id, genre.name]));
    }, [genres]);

    const availableYears = useMemo(() => {
        const years = new Set<number>();
        for (const m of movies) {
            if (typeof m.releaseYear === "number") {
                years.add(m.releaseYear);
            }
        }
        return Array.from(years).sort((a, b) => b - a);
    }, [movies]);

    const activeFilterCount = [
        searchText.trim().length > 0,
        selectedGenre !== "all",
        selectedYear !== "all",
        minRating !== "all",
        sortBy !== "newest",
    ].filter(Boolean).length;

    const clearFilters = () => {
        setSearchText("");
        setSelectedGenre("all");
        setSelectedYear("all");
        setMinRating("all");
        setSortBy("newest");
        resetPage();
    };

    const filteredMovies = useMemo(() => {
        const normalizedSearch = searchText.trim().toLowerCase();
        const minScore = minRating === "all" ? 0 : Number(minRating);
        const yearNum = selectedYear === "all" ? null : Number(selectedYear);

        const filtered = movies.filter((movie) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                movie.title?.toLowerCase().includes(normalizedSearch);

            const movieGenres = extractMovieGenres(movie, genresById);
            const matchesGenre =
                selectedGenre === "all" || movieGenres.includes(selectedGenre);

            const matchesYear =
                yearNum === null || movie.releaseYear === yearNum;

            const matchesRating =
                minScore === 0 || (typeof movie.score === "number" && movie.score >= minScore);

            return matchesSearch && matchesGenre && matchesYear && matchesRating;
        });

        return filtered.sort((a, b) => {
            if (sortBy === "newest") return (b.releaseYear ?? 0) - (a.releaseYear ?? 0);
            if (sortBy === "oldest") return (a.releaseYear ?? 0) - (b.releaseYear ?? 0);
            if (sortBy === "rating-desc") return (b.score ?? 0) - (a.score ?? 0);
            if (sortBy === "rating-asc") return (a.score ?? 0) - (b.score ?? 0);
            return 0;
        });
    }, [movies, genresById, searchText, selectedGenre, selectedYear, minRating, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filteredMovies.length / ITEMS_PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const paginatedMovies = filteredMovies.slice(
        (safePage - 1) * ITEMS_PER_PAGE,
        safePage * ITEMS_PER_PAGE
    );

    const loading = loadingMovies || loadingGenres;

    const handleFilterChange = <T,>(setter: (v: T) => void) => (value: T) => {
        setter(value);
        resetPage();
    };

    return (
        <main className="min-h-screen bg-white px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <header className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h1 className="text-3xl font-semibold">Popular Movies</h1>
                    <p className="mt-2 text-sm text-slate-600">Browse and filter trending titles by genre.</p>
                </header>

                {/* Filters */}
                <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Filter className="size-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                                    {activeFilterCount}
                                </span>
                            )}
                        </div>
                        {activeFilterCount > 0 && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                                <X className="size-3" />
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                        {/* Search */}
                        <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
                            <p className="text-xs uppercase tracking-wider text-slate-500">Search</p>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={searchText}
                                    onChange={(e) => { setSearchText(e.target.value); resetPage(); }}
                                    placeholder="Search by movie title"
                                    className="border-slate-300 bg-white pl-9 text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Genre */}
                        <div className="space-y-1.5">
                            <p className="text-xs uppercase tracking-wider text-slate-500">Genre</p>
                            <Select value={selectedGenre} onValueChange={handleFilterChange(setSelectedGenre)}>
                                <SelectTrigger className="border-slate-300 bg-white text-slate-900">
                                    <SelectValue placeholder="All genres" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All genres</SelectItem>
                                    {genres.map((genre) => (
                                        <SelectItem key={genre.id} value={genre.name}>{genre.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Year */}
                        <div className="space-y-1.5">
                            <p className="text-xs uppercase tracking-wider text-slate-500">Year</p>
                            <Select value={selectedYear} onValueChange={handleFilterChange(setSelectedYear)}>
                                <SelectTrigger className="border-slate-300 bg-white text-slate-900">
                                    <SelectValue placeholder="All years" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All years</SelectItem>
                                    {availableYears.map((year) => (
                                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Min Rating */}
                        <div className="space-y-1.5">
                            <p className="text-xs uppercase tracking-wider text-slate-500">Min Rating</p>
                            <Select value={minRating} onValueChange={handleFilterChange(setMinRating)}>
                                <SelectTrigger className="border-slate-300 bg-white text-slate-900">
                                    <SelectValue placeholder="Any rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any rating</SelectItem>
                                    <SelectItem value="4">4+ ★</SelectItem>
                                    <SelectItem value="3">3+ ★</SelectItem>
                                    <SelectItem value="2">2+ ★</SelectItem>
                                    <SelectItem value="1">1+ ★</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort */}
                        <div className="space-y-1.5">
                            <p className="text-xs uppercase tracking-wider text-slate-500">Sort By</p>
                            <Select value={sortBy} onValueChange={handleFilterChange(setSortBy)}>
                                <SelectTrigger className="border-slate-300 bg-white text-slate-900">
                                    <SelectValue placeholder="Newest first" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest first</SelectItem>
                                    <SelectItem value="oldest">Oldest first</SelectItem>
                                    <SelectItem value="rating-desc">Highest rated</SelectItem>
                                    <SelectItem value="rating-asc">Lowest rated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </section>

                {/* Results */}
                <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-slate-600">
                            Showing {filteredMovies.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredMovies.length)} of {filteredMovies.length} movies
                        </p>
                        {totalPages > 1 && (
                            <p className="text-sm text-slate-500">Page {safePage} of {totalPages}</p>
                        )}
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">Loading popular movies</p>
                                    <p className="text-xs text-slate-500">Fetching posters, genres, and ratings.</p>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Preparing catalog
                                </div>
                            </div>
                            <PopularGridSkeleton />
                        </div>
                    ) : filteredMovies.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-16 text-center">
                            <p className="text-sm text-slate-600">No movies found for the selected filters.</p>
                            <button type="button" onClick={clearFilters} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {paginatedMovies.map((movie) => {
                                    const posterUrl = resolveMediaUrl(movie.poster);

                                    return (
                                        <Link
                                            key={movie.id}
                                            href={`/movie/${movie.id}`}
                                            className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
                                        >
                                            <div className="aspect-3/4 w-full bg-slate-100">
                                                {posterUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={posterUrl}
                                                        alt={movie.title}
                                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-sm text-slate-500">No poster</div>
                                                )}
                                            </div>
                                            <div className="space-y-2 p-3">
                                                <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">{movie.title}</h3>
                                                <div className="flex items-center justify-between text-xs text-slate-600">
                                                    <span>{movie.releaseYear ?? "—"}</span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                                        {typeof movie.score === "number" ? movie.score.toFixed(1) : "—"}
                                                    </span>
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


type Genre = {
    id: string;
    name: string;
};

type Movie = {
    id: string;
    title: string;
    poster?: string;
    releaseYear?: number;
    score?: number;
    genre?: string;
    genres?: Array<{ id?: string; name?: string } | string>;
    genreId?: string;
};

function extractMovieGenres(movie: Movie, genresById: Map<string, string>) {
    const names = new Set<string>();

    if (typeof movie.genre === "string" && movie.genre.trim().length > 0) {
        names.add(movie.genre.trim());
    }

    if (typeof movie.genreId === "string" && genresById.has(movie.genreId)) {
        names.add(genresById.get(movie.genreId) as string);
    }

    if (Array.isArray(movie.genres)) {
        for (const item of movie.genres) {
            if (typeof item === "string" && item.trim().length > 0) {
                names.add(item.trim());
                continue;
            }

            if (item && typeof item === "object") {
                if (typeof item.name === "string" && item.name.trim().length > 0) {
                    names.add(item.name.trim());
                }

                if (typeof item.id === "string" && genresById.has(item.id)) {
                    names.add(genresById.get(item.id) as string);
                }
            }
        }
    }

    return Array.from(names);
}

function PopularGridSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
                <div key={`popular-skeleton-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <Skeleton className="aspect-[3/4] w-full rounded-none bg-slate-200" />
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

export default function PopularPage() {
    const [searchText, setSearchText] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("all");

    const { data: rawMovies, isLoading: loadingMovies } = useQuery({
        queryKey: ["popular-page-movies"],
        queryFn: getPopularMovies,
    });

    const { data: rawGenres, isLoading: loadingGenres } = useQuery({
        queryKey: ["popular-page-genres"],
        queryFn: getGenres,
    });

    const movies = useMemo(() => {
        return (Array.isArray(rawMovies) ? rawMovies : []) as Movie[];
    }, [rawMovies]);

    const genres = useMemo(() => {
        return (Array.isArray(rawGenres) ? rawGenres : []) as Genre[];
    }, [rawGenres]);

    const genresById = useMemo(() => {
        return new Map(genres.map((genre) => [genre.id, genre.name]));
    }, [genres]);

    const filteredMovies = useMemo(() => {
        const normalizedSearch = searchText.trim().toLowerCase();

        return movies.filter((movie) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                movie.title?.toLowerCase().includes(normalizedSearch);

            const movieGenres = extractMovieGenres(movie, genresById);

            const matchesGenre =
                selectedGenre === "all" || movieGenres.includes(selectedGenre);

            return matchesSearch && matchesGenre;
        });
    }, [movies, genresById, searchText, selectedGenre]);

    const loading = loadingMovies || loadingGenres;

    return (
        <main className="min-h-screen bg-white px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <header className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h1 className="text-3xl font-semibold">Popular Movies</h1>
                    <p className="mt-2 text-sm text-slate-600">Browse and filter trending titles by genre.</p>
                </header>



                <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Filter className="size-4" />
                        Filters
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                            <p className="text-xs uppercase tracking-wider text-slate-500">Search</p>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={searchText}
                                    onChange={(event) => setSearchText(event.target.value)}
                                    placeholder="Search by movie title"
                                    className="border-slate-300 bg-white pl-9 text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs uppercase tracking-wider text-slate-500">Genre</p>
                            <Select
                                value={selectedGenre}
                                onValueChange={(value) => setSelectedGenre(value ?? "all")}
                            >
                                <SelectTrigger className="border-slate-300 bg-white text-slate-900">
                                    <SelectValue placeholder="All genres" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All genres</SelectItem>
                                    {genres.map((genre) => (
                                        <SelectItem key={genre.id} value={genre.name}>
                                            {genre.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm text-slate-600">Showing {filteredMovies.length} movies</p>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">Loading popular movies</p>
                                    <p className="text-xs text-slate-500">Fetching posters, genres, and ratings.</p>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Preparing catalog
                                </div>
                            </div>
                            <PopularGridSkeleton />
                        </div>
                    ) : filteredMovies.length === 0 ? (
                        <p className="text-sm text-slate-600">No movies found for the selected filters.</p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredMovies.map((movie) => {
                                const posterUrl = resolveMediaUrl(movie.poster);

                                return (
                                    <Link
                                        key={movie.id}
                                        href={`/movie/${movie.id}`}
                                        className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
                                    >
                                        <div className="aspect-3/4 w-full bg-slate-100">
                                            {posterUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={posterUrl}
                                                    alt={movie.title}
                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-sm text-slate-500">No poster</div>
                                            )}
                                        </div>
                                        <div className="space-y-2 p-3">
                                            <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">{movie.title}</h3>
                                            <div className="flex items-center justify-between text-xs text-slate-600">
                                                <span>{movie.releaseYear ?? "—"}</span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Star className="size-3.5 text-amber-400" />
                                                    {typeof movie.score === "number" ? movie.score.toFixed(1) : "—"}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
