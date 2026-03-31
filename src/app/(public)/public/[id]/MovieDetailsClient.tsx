/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Bookmark,
    Calendar,
    Globe,
    Heart,
    Share2,
    Sparkles,
    Star,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ReviewComment {
    id: string;
    userId: string;
    content: string;
    isSpoiler: boolean;
    createdAt: string;
}

interface Review {
    id: string;
    userId: string;
    rating: number;
    content: string;
    isSpoiler: boolean;
    tags: string[];
    status: string;
    createdAt: string;
    comments: ReviewComment[];
}

interface Movie {
    id: string;
    title: string;
    releaseDate: string;
    posterPath: string;
    backdropPath?: string;
    rating: number;
    language: string;
    genre: string[];
    isNew?: boolean;
    votes: number;
    certification?: string;
    tagline?: string;
    overview?: string;
    ageGroup?: string;
    priceType?: string;
    director?: { name: string; role: string };
    writers?: { name: string; role: string }[];
    cast?: { name: string; character: string; avatar?: string }[];
    reviews?: Review[];
}

function formatLongDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unknown date";
    }

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function shortId(value: string) {
    return value.length > 8 ? `${value.slice(0, 8)}...` : value;
}

type MovieDetailsClientProps = {
    movie: Movie;
    isAuthenticated: boolean;
    canSaveToLibrary: boolean;
    initialSaved: boolean;
    initialWatchlistId: string | null;
    loginHref: string;
};

export default function MovieDetailsClient({
    movie,
    isAuthenticated,
    canSaveToLibrary,
    initialSaved,
    initialWatchlistId,
    loginHref,
}: MovieDetailsClientProps) {
    const router = useRouter();
    const [isSaved, setIsSaved] = useState(initialSaved);
    const [watchlistId, setWatchlistId] = useState<string | null>(initialWatchlistId);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
    const [isMutating, startTransition] = useTransition();

    const year = useMemo(() => {
        const date = new Date(movie.releaseDate);
        return Number.isNaN(date.getTime()) ? "-" : String(date.getFullYear());
    }, [movie.releaseDate]);

    const approvedCount = useMemo(() => {
        return (movie.reviews ?? []).filter((review) => review.status === "APPROVED").length;
    }, [movie.reviews]);

    const actionLabel = isSaved ? "Removing..." : "Saving...";

    const handleProtectedSave = () => {
        if (!isAuthenticated) {
            setIsLoginPromptOpen(true);
            return;
        }

        if (!canSaveToLibrary) {
            setFeedbackMessage("Only user and premium_user accounts can save movies to the dashboard.");
            return;
        }

        const method = isSaved ? "DELETE" : "POST";
        const nextSavedState = !isSaved;

        startTransition(async () => {
            try {
                setFeedbackMessage(null);

                const response = await fetch("/api/user/watchlist", {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        movieId: movie.id,
                        watchlistId,
                    }),
                });

                const payload = await response.json().catch(() => ({ message: "Unable to update watchlist." }));

                if (!response.ok) {
                    if (response.status === 401) {
                        setIsLoginPromptOpen(true);
                        return;
                    }

                    throw new Error(typeof payload.message === "string" ? payload.message : "Unable to update watchlist.");
                }

                setIsSaved(nextSavedState);
                if (nextSavedState) {
                    const result = typeof payload === "object" && payload !== null
                        ? (payload as { result?: { id?: unknown }; data?: { id?: unknown } })
                        : null;
                    const createdId = result?.result?.id ?? result?.data?.id;
                    if (typeof createdId === "string") {
                        setWatchlistId(createdId);
                    }
                } else {
                    setWatchlistId(null);
                }
                setFeedbackMessage(nextSavedState
                    ? "Saved to your watchlist. It will appear in your dashboard."
                    : "Removed from your watchlist dashboard.");
            } catch (error) {
                setFeedbackMessage(error instanceof Error ? error.message : "Unable to update watchlist.");
            }
        });
    };

    return (
        <div className="min-h-screen bg-white text-slate-900">
            {isLoginPromptOpen ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="login-required-title"
                    onClick={() => setIsLoginPromptOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">Login Required</p>
                            <h2 id="login-required-title" className="text-2xl font-semibold tracking-tight">
                                You need to log in first
                            </h2>
                            <p className="text-sm leading-6 text-slate-300">
                                Sign in as a user or premium_user to save movies to your favorites and watchlist dashboard.
                            </p>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                className="border border-white/15 bg-white/5 text-white hover:bg-white/10"
                                onClick={() => setIsLoginPromptOpen(false)}
                            >
                                Not now
                            </Button>
                            <Button
                                type="button"
                                className="bg-sky-500 text-slate-950 hover:bg-sky-400"
                                onClick={() => router.push(loginHref)}
                            >
                                Go to Login
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}

            <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950 text-white">
                <img
                    src={movie.backdropPath || movie.posterPath}
                    alt={movie.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/90 to-slate-900/70" />

                <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <Button
                        variant="secondary"
                        onClick={() => router.back()}
                        className="mb-6 gap-2 border border-white/20 bg-white/10 text-white hover:bg-white/20"
                    >
                        <ArrowLeft className="size-4" />
                        Back
                    </Button>

                    <div className="grid gap-8 md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[340px_minmax(0,1fr)]">
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
                                <img src={movie.posterPath} alt={movie.title} className="h-full w-full object-cover" />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="space-y-5">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{movie.title}</h1>
                                <span className="text-xl text-slate-300">({year})</span>
                                {movie.certification && (
                                    <Badge className="border border-white/30 bg-white/10 text-white">
                                        {movie.certification}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar className="size-4" />
                                    {formatLongDate(movie.releaseDate)}
                                </span>
                                <span className="text-white/40">|</span>
                                <span>{movie.genre.length > 0 ? movie.genre.join(", ") : "Genres coming soon"}</span>
                                <span className="text-white/40">|</span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Globe className="size-4" />
                                    {movie.language}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2">
                                    <p className="text-xs uppercase tracking-wide text-slate-300">Rating</p>
                                    <p className="mt-1 inline-flex items-center gap-1 text-lg font-semibold">
                                        <Star className="size-4 fill-amber-400 text-amber-400" />
                                        {movie.rating.toFixed(1)}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2">
                                    <p className="text-xs uppercase tracking-wide text-slate-300">Votes</p>
                                    <p className="mt-1 text-lg font-semibold">{movie.votes.toLocaleString()}</p>
                                </div>
                                <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2">
                                    <p className="text-xs uppercase tracking-wide text-slate-300">Approved Reviews</p>
                                    <p className="mt-1 text-lg font-semibold">{approvedCount}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="secondary"
                                    className="gap-2 border border-white/20 bg-white/10 text-white hover:bg-white/20"
                                    onClick={handleProtectedSave}
                                    disabled={isMutating}
                                >
                                    <Heart className={cn("size-4", isSaved && "fill-rose-500 text-rose-500")} />
                                    {isMutating ? actionLabel : isSaved ? "Favorited" : "Favorite"}
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="gap-2 border border-white/20 bg-white/10 text-white hover:bg-white/20"
                                    onClick={handleProtectedSave}
                                    disabled={isMutating}
                                >
                                    <Bookmark className={cn("size-4", isSaved && "fill-sky-400 text-sky-400")} />
                                    {isMutating ? actionLabel : isSaved ? "In Watchlist" : "Add to Watchlist"}
                                </Button>
                                <Button variant="secondary" className="gap-2 border border-white/20 bg-white/10 text-white hover:bg-white/20">
                                    <Share2 className="size-4" />
                                    Share
                                </Button>
                            </div>

                            <div className="min-h-6">
                                {feedbackMessage ? (
                                    <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-slate-200">
                                        {feedbackMessage}
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-300/80">
                                        Saved movies appear in your user dashboard watchlist.
                                    </p>
                                )}
                            </div>

                            {movie.tagline && <p className="text-base italic text-slate-300">{movie.tagline}</p>}
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="h-auto flex-wrap justify-start rounded-xl border border-slate-200 bg-slate-50 p-1">
                        <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
                        <TabsTrigger value="cast" className="rounded-lg">Cast & Crew</TabsTrigger>
                        <TabsTrigger value="reviews" className="rounded-lg">Reviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                <h2 className="text-xl font-semibold">Overview</h2>
                                <p className="mt-3 leading-7 text-slate-600">{movie.overview || "No overview available yet."}</p>

                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-500">Age Group</p>
                                        <p className="mt-1 font-medium">{movie.ageGroup || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-500">Price Type</p>
                                        <p className="mt-1 font-medium">{movie.priceType || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Director</p>
                                    <p className="mt-1 font-semibold">{movie.director?.name || "Not available"}</p>
                                    <p className="text-sm text-slate-500">{movie.director?.role || "-"}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Writers</p>
                                    {movie.writers && movie.writers.length > 0 ? (
                                        <div className="mt-2 space-y-2">
                                            {movie.writers.map((writer, index) => (
                                                <div key={`${writer.name}-${index}`}>
                                                    <p className="font-semibold">{writer.name}</p>
                                                    <p className="text-sm text-slate-500">{writer.role}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-1 text-sm text-slate-500">Not available</p>
                                    )}
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Genres</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {movie.genre.length > 0 ? (
                                            movie.genre.map((item) => (
                                                <Badge key={item} variant="secondary" className="rounded-full">
                                                    {item}
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500">No genres available.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="cast" className="space-y-6">
                        {movie.cast && movie.cast.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {movie.cast.map((actor, index) => (
                                    <motion.div
                                        key={`${actor.name}-${index}`}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(index * 0.02, 0.24) }}
                                        className="rounded-2xl border border-slate-200 bg-white p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12 border border-slate-200">
                                                <AvatarImage src={actor.avatar} alt={actor.name} />
                                                <AvatarFallback>{actor.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{actor.name}</p>
                                                <p className="text-sm text-slate-500">{actor.character || "Role unknown"}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                                Cast and crew details are not available yet.
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="reviews" className="space-y-4">
                        {!movie.reviews || movie.reviews.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                                No reviews yet.
                            </div>
                        ) : (
                            movie.reviews.map((review, index) => (
                                <motion.article
                                    key={review.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(index * 0.03, 0.24) }}
                                    className="rounded-2xl border border-slate-200 bg-white p-5"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-slate-200">
                                                <AvatarFallback>{review.userId.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{shortId(review.userId)}</p>
                                                <p className="text-xs text-slate-500">{formatLongDate(review.createdAt)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                <Star className="size-3.5 fill-amber-500 text-amber-500" />
                                                {review.rating}/5
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "rounded-full",
                                                    review.status === "APPROVED"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-slate-100 text-slate-700"
                                                )}
                                            >
                                                {review.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    {review.isSpoiler && (
                                        <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                                            <Sparkles className="size-4" />
                                            This review may contain spoilers.
                                        </p>
                                    )}

                                    <p className="mt-3 leading-7 text-slate-700">{review.content}</p>

                                    {review.tags.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {review.tags.map((tag) => (
                                                <Badge key={tag} variant="outline" className="rounded-full text-xs">
                                                    #{tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {review.comments.length > 0 && (
                                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                                {review.comments.length} Comment{review.comments.length === 1 ? "" : "s"}
                                            </p>
                                            <div className="mt-3 space-y-3">
                                                {review.comments.map((comment) => (
                                                    <div key={comment.id} className="flex items-start gap-3">
                                                        <Avatar className="h-7 w-7 border border-slate-200">
                                                            <AvatarFallback className="text-[10px]">
                                                                {comment.userId.slice(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="text-xs font-semibold">{shortId(comment.userId)}</p>
                                                                <p className="text-xs text-slate-500">{formatLongDate(comment.createdAt)}</p>
                                                                {comment.isSpoiler && (
                                                                    <Badge variant="secondary" className="rounded-full text-[10px]">spoiler</Badge>
                                                                )}
                                                            </div>
                                                            <p className="mt-1 text-sm text-slate-700">{comment.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.article>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </section>
        </div>
    );
}
