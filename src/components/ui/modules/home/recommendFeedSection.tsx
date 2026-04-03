"use client";

import Link from "next/link";
import React from "react";
import { Film, LogIn, Sparkles, SlidersHorizontal, X, Clapperboard, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media";
import { Skeleton } from "@/components/ui/skeleton";

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
};

type RecommendedMovie = {
    id: string;
    title: string;
    poster: string;
    releaseYear?: number;
    description?: string;
    director?: string;
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
            const id = movie.id ?? movie._id ?? movie.movieId ?? `recommended-${index + 1}`;
            const title = movie.title ?? movie.name ?? "Untitled";

            return {
                id,
                title,
                poster:
                    resolveMediaUrl(movie.poster ?? movie.posterPath) ||
                    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",
                releaseYear: movie.releaseYear,
                description: movie.description,
                director: movie.director,
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

            // Condition 3: logged out → show nothing
            if (!isUserLoggedIn) {
                setRecommendedMovies([]);
                setErrorMessage("");
                setIsInitialLoading(false);
                return;
            }

            // Condition 1 & 2: let the recommendations endpoint decide.
            // If user has saved preferences → backend returns movies → show them.
            // If user has no saved preferences → backend returns empty → show nothing.
            // This survives page reloads reliably without a brittle preference-check detour.
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
        <section className="relative overflow-hidden py-16">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-muted/10 via-background to-muted/30" />
            <div className="pointer-events-none absolute left-1/4 top-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

            <div className="container relative mx-auto px-4">
                {/* Header card */}
                <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-lg backdrop-blur-sm">
                    <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-10">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                                <Sparkles className="size-3.5" />
                                Recommend Your Feed
                            </span>
                            <h2 className="text-2xl font-bold leading-tight md:text-4xl">
                                Personalized picks <br className="hidden md:block" />based on your taste
                            </h2>
                            <p className="max-w-lg text-sm text-muted-foreground md:text-base">
                                Tell us what you love &mdash; genres, platforms &mdash; and we&apos;ll surface movies made for you.
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs">
                                {["Quick setup", "Genre + platform based", "Instant recommendations"].map((tag) => (
                                    <span key={tag} className="rounded-full border border-border/80 bg-muted/50 px-3 py-1 text-muted-foreground">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="shrink-0">
                            {!isLoggedIn ? (
                                <Link
                                    href="/login"
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-primary/30"
                                >
                                    <LogIn className="size-4" />
                                    Login To Get Recommendations
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleOpenPreferences}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-primary/30"
                                >
                                    <SlidersHorizontal className="size-4" />
                                    Set Preferences
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error message */}
                {errorMessage ? (
                    <div className="mx-auto mt-4 max-w-6xl rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
                        {errorMessage}
                    </div>
                ) : null}

                {/* Skeleton loading */}
                {isInitialLoading && isLoggedIn ? (
                    <div className="mx-auto mt-10 max-w-6xl">
                        <div className="mb-5 flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-5 w-52 rounded-full" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={`rec-skeleton-${i}`} className="overflow-hidden rounded-2xl border border-border">
                                    <Skeleton className="aspect-2/3 w-full" />
                                    <div className="space-y-2 p-3">
                                        <Skeleton className="h-4 w-4/5 rounded-full" />
                                        <Skeleton className="h-3 w-1/2 rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                {/* Recommended Movies grid */}
                {!isInitialLoading && recommendedMovies.length > 0 ? (
                    <div className="mx-auto mt-10 max-w-6xl">
                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Film className="size-5 text-primary" />
                                <h3 className="text-lg font-bold">Recommended For You</h3>
                                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                    {recommendedMovies.length}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleOpenPreferences}
                                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                            >
                                <SlidersHorizontal className="size-3" />
                                Update Preferences
                            </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {recommendedMovies.map((movie) => (
                                <Link
                                    key={movie.id}
                                    href={`/movie/${movie.id}`}
                                    className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
                                >
                                    <div className="relative aspect-2/3 overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={movie.poster}
                                            alt={movie.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
                                        {/* Title on hover overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <p className="line-clamp-2 text-sm font-bold text-white drop-shadow-md">
                                                {movie.title}
                                            </p>
                                            {(movie.releaseYear ?? movie.director) ? (
                                                <p className="mt-0.5 text-xs text-white/70">
                                                    {[movie.releaseYear, movie.director].filter(Boolean).join(" • ")}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : null}

                {/* Empty state: logged in, no preferences set, not loading */}
                {!isInitialLoading && isLoggedIn && recommendedMovies.length === 0 && !errorMessage ? (
                    <div className="mx-auto mt-10 max-w-6xl">
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
                            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                                <Clapperboard className="size-8 text-primary/70" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold">No recommendations yet</h3>
                            <p className="mb-6 max-w-xs text-sm text-muted-foreground">
                                Select your favorite genres and streaming platforms to get personalized movie picks.
                            </p>
                            <button
                                type="button"
                                onClick={handleOpenPreferences}
                                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                <SlidersHorizontal className="size-4" />
                                Set My Preferences
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Modal */}
            {isModalOpen ? (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="preference-modal-title"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="w-full max-w-2xl rounded-3xl border border-border bg-background shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="size-4 text-primary" />
                                <h3 id="preference-modal-title" className="font-semibold">
                                    Choose your genres &amp; platforms
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="max-h-[60vh] overflow-y-auto p-6">
                            {isOptionsLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-4 w-20 rounded-full" />
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <Skeleton key={`genre-sk-${i}`} className="h-8 w-20 rounded-full" />
                                        ))}
                                    </div>
                                    <Skeleton className="mt-4 h-4 w-24 rounded-full" />
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Skeleton key={`plat-sk-${i}`} className="h-8 w-24 rounded-full" />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-7">
                                    <div>
                                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Genres</p>
                                        <div className="flex flex-wrap gap-2">
                                            {genres.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">No genres found.</p>
                                            ) : (
                                                genres.map((genre) => (
                                                    <button
                                                        key={genre.id}
                                                        type="button"
                                                        onClick={() => toggleSelection(genre.id, selectedGenres, setSelectedGenres)}
                                                        className={cn(
                                                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                                                            selectedGenres.includes(genre.id)
                                                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                                                : "border-border bg-background hover:border-primary/50 hover:bg-muted",
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
                                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Streaming Platforms</p>
                                        <div className="flex flex-wrap gap-2">
                                            {platforms.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">No platforms found.</p>
                                            ) : (
                                                platforms.map((platform) => (
                                                    <button
                                                        key={platform.id}
                                                        type="button"
                                                        onClick={() => toggleSelection(platform.id, selectedPlatforms, setSelectedPlatforms)}
                                                        className={cn(
                                                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                                                            selectedPlatforms.includes(platform.id)
                                                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                                                : "border-border bg-background hover:border-primary/50 hover:bg-muted",
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
                        <div className="flex items-center justify-between border-t border-border/60 px-6 py-4">
                            <p className="text-xs text-muted-foreground">
                                {selectedGenres.length + selectedPlatforms.length} selected
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-full border border-border px-5 py-2 text-sm font-medium hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGetRecommendations}
                                    disabled={isOptionsLoading || isRecommendationsLoading}
                                    className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
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
