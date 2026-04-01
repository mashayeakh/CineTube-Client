"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Filter, Search, Star } from "lucide-react";
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

import { getGenres } from "../public/_actions/genres";
import { getPopularMovies } from "../public/_actions/popular";

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
