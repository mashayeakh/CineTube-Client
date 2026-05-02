"use client";

import Link from "next/link";
import React from "react";
import { Film, LogIn, Sparkles, SlidersHorizontal, X, Clapperboard, Check, ChevronRight, Star, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

type OptionItem = {
    id: string;
    name: string;
};

type RawMovie = {
    _id?: string;
    id?: string;
    movieId?: string;
    title?: string;
    name?: string;
    poster?: string;
    posterPath?: string;
    releaseYear?: number;
    description?: string;
    director?: string;
    rating?: number;
};

type RecommendedMovie = {
    id: string;
    title: string;
    poster: string;
    releaseYear?: number;
    description?: string;
    director?: string;
    rating?: number;
};

type OptionsPayload = {
    genres?: OptionItem[];
    platforms?: OptionItem[];
    message?: string;
};

type RecommendationPayload = {
    result?: RawMovie[];
    data?: RawMovie[];
    items?: RawMovie[];
    movies?: RawMovie[];
    recommendations?: RawMovie[];
    message?: string;
};

function extractMovies(payload: RecommendationPayload): RawMovie[] {
    if (Array.isArray(payload.result)) {
        return payload.result;
    }

    if (Array.isArray(payload.data)) {
        return payload.data;
    }

    if (Array.isArray(payload.items)) {
        return payload.items;
    }

    if (Array.isArray(payload.movies)) {
        return payload.movies;
    }

    if (Array.isArray(payload.recommendations)) {
        return payload.recommendations;
    }

    return [];
}

function normalizeMovieList(list: RawMovie[]): RecommendedMovie[] {
    return list
        .map((movie, index) => {
            const id = movie.id ?? movie._id ?? movie.movieId ?? `recommended - ${index + 1} `;
            const title = movie.title ?? movie.name ?? "Untitled";

            return {
                id,
                title,
                poster:
                    resolveMediaUrl(movie.poster ?? movie.posterPath) ||
                    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format",
                releaseYear: movie.releaseYear,
                description: movie.description,
                director: movie.director,
                rating: movie.rating,
            };
        })
        .filter((movie) => Boolean(movie.id && movie.title));
}

function getAuthRoleCookie() {
    if (typeof document === "undefined") {
        return null;
    }

    const rawCookie = document.cookie
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("_auth="));

    if (!rawCookie) {
        return null;
    }

    const value = rawCookie.split("=")[1] ?? "";
    return value.trim() || null;
}

export default function RecommendFeedSection() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [isInitialLoading, setIsInitialLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isOptionsLoading, setIsOptionsLoading] = React.useState(false);
    const [isRecommendationsLoading, setIsRecommendationsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [genres, setGenres] = React.useState<OptionItem[]>([]);
    const [platforms, setPlatforms] = React.useState<OptionItem[]>([]);
    const [selectedGenres, setSelectedGenres] = React.useState<string[]>([]);
    const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>([]);
    const [recommendedMovies, setRecommendedMovies] = React.useState<RecommendedMovie[]>([]);

    const fetchRecommendations = React.useCallback(async (silent = false): Promise<RecommendedMovie[]> => {
        try {
            const recommendationsResponse = await fetch("/api/user-preferences/recommendations", {
                method: "GET",
                cache: "no-store",
            });

            const recommendationsPayload = (await recommendationsResponse.json().catch(() => ({}))) as RecommendationPayload;

            if (!recommendationsResponse.ok) {
                if (!silent) {
                    setErrorMessage(recommendationsPayload.message ?? "Failed to fetch recommended movies.");
                }

                return [];
            }

            const normalized = normalizeMovieList(extractMovies(recommendationsPayload));

            if (normalized.length === 0) {
                if (!silent) {
                    setErrorMessage("No recommended movies found yet. Update your preferences and try again.");
                }

                return [];
            }

            setRecommendedMovies(normalized);
            return normalized;
        } catch {
            if (!silent) {
                setErrorMessage("Something went wrong while fetching recommendations.");
            }

            return [];
        }
    }, []);

    React.useEffect(() => {
        const init = async () => {
            const isUserLoggedIn = Boolean(getAuthRoleCookie());
            setIsLoggedIn(isUserLoggedIn);

            if (!isUserLoggedIn) {
                setRecommendedMovies([]);
                setErrorMessage("");
                setIsInitialLoading(false);
                return;
            }

            await fetchRecommendations(true);
            setIsInitialLoading(false);
        };

        void init();
    }, [fetchRecommendations]);

    const fetchOptions = React.useCallback(async () => {
        setIsOptionsLoading(true);
        setErrorMessage("");

        try {
            const response = await fetch("/api/user-preferences/options", {
                method: "GET",
                cache: "no-store",
            });

            const payload = (await response.json().catch(() => ({}))) as OptionsPayload;

            if (!response.ok) {
                setErrorMessage(payload.message ?? "Failed to load genres and platforms.");
                return;
            }

            setGenres(Array.isArray(payload.genres) ? payload.genres : []);
            setPlatforms(Array.isArray(payload.platforms) ? payload.platforms : []);
        } catch {
            setErrorMessage("Failed to load genres and platforms.");
        } finally {
            setIsOptionsLoading(false);
        }
    }, []);

    const handleOpenPreferences = async () => {
        setIsModalOpen(true);

        if (genres.length === 0 && platforms.length === 0) {
            await fetchOptions();
        }
    };

    const toggleSelection = (
        id: string,
        selected: string[],
        update: React.Dispatch<React.SetStateAction<string[]>>,
    ) => {
        if (!id) {
            return;
        }

        if (selected.includes(id)) {
            update(selected.filter((item) => item !== id));
            return;
        }

        update([...selected, id]);
    };

    const handleGetRecommendations = async () => {
        setIsRecommendationsLoading(true);
        setErrorMessage("");

        try {
            let saveWarning = "";
            const saveResponse = await fetch("/api/user-preferences/preference", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    genreIds: selectedGenres,
                    platformIds: selectedPlatforms,
                    preferredGenreIds: selectedGenres,
                    preferredPlatformIds: selectedPlatforms,
                    genre: selectedGenres,
                    platform: selectedPlatforms,
                    genres: selectedGenres,
                    platforms: selectedPlatforms,
                }),
            });

            const savePayload = (await saveResponse.json().catch(() => ({}))) as { message?: string };

            if (!saveResponse.ok) {
                saveWarning = savePayload.message ?? "Preference save failed. Showing latest available recommendations.";
            }

            const normalized = await fetchRecommendations(false);

            if (normalized.length === 0) {
                return;
            }

            if (saveWarning) {
                setErrorMessage(saveWarning);
            }

            setIsModalOpen(false);
        } catch {
            setErrorMessage("Something went wrong while fetching recommendations.");
        } finally {
            setIsRecommendationsLoading(false);
        }
    };

    return (
        <section className="relative overflow-hidden py-20">
            {/* Enhanced Background with gradient orbs */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
            <div className="pointer-events-none absolute -left-20 top-20 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
            <div className="pointer-events-none absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-purple-500/10 blur-[100px]" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[120px]" />

            <div className="container relative mx-auto px-4">
                {/* Header card - Enhanced with glassmorphism */}
                <div className="group mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-card/90 via-card/80 to-card/90 shadow-2xl shadow-primary/5 backdrop-blur-md transition-all duration-500 hover:shadow-primary/10">
                    <div className="relative">
                        {/* Decorative accent line */}
                        <div className="absolute left-0 top-0 h-1 w-32 rounded-full bg-gradient-to-r from-primary to-purple-500" />

                        <div className="flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between md:p-10">
                            <div className="space-y-5">
                                <div className="inline-flex animate-in fade-in slide-in-from-top-3 duration-500">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur-sm">
                                        <Sparkles className="size-3.5" />
                                        AI-Powered Recommendations
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                                        Discover your next
                                        <br />
                                        <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                                            favorite movie
                                        </span>
                                    </h2>
                                    <p className="max-w-md text-sm text-muted-foreground/80 md:text-base">
                                        Get personalized recommendations based on your unique taste in genres and streaming platforms.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {["Smart Matching", "Genre Based", "Platform Aware", "Daily Updates"].map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/30 hover:text-primary"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="shrink-0">
                                {!isLoggedIn ? (
                                    <Link
                                        href="/login"
                                        className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-primary to-purple-600 px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-primary/40"
                                    >
                                        <LogIn className="size-4 transition-transform group-hover:rotate-12" />
                                        Get Started
                                        <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleOpenPreferences}
                                        className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-primary to-purple-600 px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-primary/40"
                                    >
                                        <SlidersHorizontal className="size-4 transition-transform group-hover:rotate-12" />
                                        Set Preferences
                                        <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Error message */}
                {errorMessage ? (
                    <div className="mx-auto mt-6 max-w-5xl animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400 backdrop-blur-sm">
                            <span className="font-medium">⚠️</span> {errorMessage}
                        </div>
                    </div>
                ) : null}

                {/* Skeleton loading with shimmer effect */}
                {isInitialLoading && isLoggedIn ? (
                    <div className="mx-auto mt-12 max-w-6xl">
                        <div className="mb-6 flex animate-pulse items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-muted" />
                            <div className="h-5 w-48 rounded-full bg-muted" />
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Card key={`rec-skeleton-${i}`} className="overflow-hidden border border-white/10 bg-card/50 p-0">
                                    <Skeleton className="aspect-[2/3] w-full" />
                                    <div className="space-y-2 p-4">
                                        <Skeleton className="h-4 w-4/5 rounded-full" />
                                        <Skeleton className="h-3 w-1/3 rounded-full" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ) : null}

                {/* Recommended Movies grid - Enhanced with better cards */}
                {!isInitialLoading && recommendedMovies.length > 0 ? (
                    <div className="mx-auto mt-12 max-w-6xl">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-primary/15 p-2">
                                    <TrendingUp className="size-4 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">Recommended For You</h3>
                                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                    {recommendedMovies.length}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleOpenPreferences}
                                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                            >
                                <SlidersHorizontal className="size-3" />
                                Update Preferences
                            </button>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {recommendedMovies.map((movie, index) => (
                                <Link
                                    key={movie.id}
                                    href={`/movie/${movie.id}`}
                                    className="group relative animate-in fade-in slide-in-from-bottom-3 duration-500"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <Card className="relative overflow-hidden border border-white/10 bg-card/60 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 p-0">
                                        <div className="relative aspect-[2/3] overflow-hidden">
                                            <img
                                                src={movie.poster}
                                                alt={movie.title}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            {/* Dark gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

                                            {/* Rating badge */}
                                            {movie.rating && (
                                                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-yellow-400 backdrop-blur-sm">
                                                    <Star className="size-2.5 fill-yellow-400" />
                                                    {movie.rating.toFixed(1)}
                                                </div>
                                            )}

                                            {/* Year badge */}
                                            {movie.releaseYear && (
                                                <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white/80 backdrop-blur-sm">
                                                    {movie.releaseYear}
                                                </div>
                                            )}

                                            {/* Content overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                                <h4 className="line-clamp-2 text-sm font-bold text-white drop-shadow-lg">
                                                    {movie.title}
                                                </h4>
                                                {movie.director && (
                                                    <p className="mt-1 text-xs text-white/60">
                                                        {movie.director}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Hover action indicator */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            <div className="rounded-full bg-primary/90 p-2 shadow-lg">
                                                <Film className="size-5 text-white" />
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : null}

                {/* Enhanced Empty state */}
                {!isInitialLoading && isLoggedIn && recommendedMovies.length === 0 && !errorMessage ? (
                    <div className="mx-auto mt-12 max-w-5xl">
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/15 bg-gradient-to-br from-muted/30 to-muted/10 px-6 py-16 text-center backdrop-blur-sm">
                                <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
                                <div className="relative">
                                    <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20">
                                        <Clapperboard className="size-9 text-primary/70" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold">No recommendations yet</h3>
                                    <p className="mx-auto mb-7 max-w-xs text-sm text-muted-foreground">
                                        Tell us what you love — select your favorite genres and streaming platforms to get personalized movie picks.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleOpenPreferences}
                                        className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-purple-600 px-6 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:scale-105 hover:shadow-primary/40"
                                    >
                                        <Sparkles className="size-4" />
                                        Set My Preferences
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Enhanced Modal with better animations */}
            {isModalOpen ? (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 backdrop-blur-md sm:items-center animate-in fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="preference-modal-title"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="w-full max-w-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 rounded-2xl border border-white/10 bg-gradient-to-br from-card to-card/95 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="rounded-full bg-primary/15 p-1.5">
                                    <Sparkles className="size-4 text-primary" />
                                </div>
                                <h3 id="preference-modal-title" className="font-semibold text-lg">
                                    Customize your feed
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-full p-1.5 text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="max-h-[60vh] overflow-y-auto p-6">
                            {isOptionsLoading ? (
                                <div className="space-y-6">
                                    <div>
                                        <Skeleton className="mb-3 h-4 w-20 rounded-full" />
                                        <div className="flex flex-wrap gap-2">
                                            {Array.from({ length: 8 }).map((_, i) => (
                                                <Skeleton key={`genre - sk - ${i} `} className="h-8 w-20 rounded-full" />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <Skeleton className="mb-3 h-4 w-24 rounded-full" />
                                        <div className="flex flex-wrap gap-2">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Skeleton key={`plat - sk - ${i} `} className="h-8 w-24 rounded-full" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div>
                                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary">1</span>
                                            Select Genres
                                        </p>
                                        <div className="flex flex-wrap gap-2.5">
                                            {genres.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">No genres found.</p>
                                            ) : (
                                                genres.map((genre) => (
                                                    <button
                                                        key={genre.id}
                                                        type="button"
                                                        onClick={() => toggleSelection(genre.id, selectedGenres, setSelectedGenres)}
                                                        className={cn(
                                                            "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
                                                            selectedGenres.includes(genre.id)
                                                                ? "border-primary/50 bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                                                : "border-white/10 bg-white/5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
                                                        )}
                                                    >
                                                        {selectedGenres.includes(genre.id) && <Check className="size-3" />}
                                                        {genre.name}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary">2</span>
                                            Select Platforms
                                        </p>
                                        <div className="flex flex-wrap gap-2.5">
                                            {platforms.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">No platforms found.</p>
                                            ) : (
                                                platforms.map((platform) => (
                                                    <button
                                                        key={platform.id}
                                                        type="button"
                                                        onClick={() => toggleSelection(platform.id, selectedPlatforms, setSelectedPlatforms)}
                                                        className={cn(
                                                            "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
                                                            selectedPlatforms.includes(platform.id)
                                                                ? "border-primary/50 bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                                                : "border-white/10 bg-white/5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
                                                        )}
                                                    >
                                                        {selectedPlatforms.includes(platform.id) && <Check className="size-3" />}
                                                        {platform.name}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal footer */}
                        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
                            <p className="text-xs text-muted-foreground">
                                {selectedGenres.length + selectedPlatforms.length} {selectedGenres.length + selectedPlatforms.length === 1 ? 'selection' : 'selections'}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-full border border-white/10 px-5 py-2 text-sm font-medium transition-all hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGetRecommendations}
                                    disabled={isOptionsLoading || isRecommendationsLoading}
                                    className="rounded-full bg-gradient-to-r from-primary to-purple-600 px-6 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:scale-105 hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isRecommendationsLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Fetching...
                                        </span>
                                    ) : (
                                        "Get Recommendations"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
