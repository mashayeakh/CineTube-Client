/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState, useTransition, type ReactElement } from "react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Bookmark,
    Calendar,
    ClockFading,
    Globe,
    Heart,
    MessageCircle,
    Reply,
    Share2,
    Sparkles,
    Star,
    ThumbsUp,
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
    parentId: string | null;
    content: string;
    isSpoiler: boolean;
    createdAt: string;
    replies: ReviewComment[];
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
    likesCount?: number;
    likedByCurrentUser?: boolean;
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

function normalizeTextId(value: unknown) {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : "";
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }

    return "";
}

function mapCommentNode(value: unknown): ReviewComment | null {
    if (!value || typeof value !== "object") {
        return null;
    }

    const record = value as Record<string, unknown>;
    const nestedReplies = Array.isArray(record.replies) ? record.replies : [];
    const id = normalizeTextId(record.id);

    if (!id) {
        return null;
    }

    return {
        id,
        userId: normalizeTextId(record.userId ?? (record.user as { id?: unknown; _id?: unknown } | undefined)?.id ?? (record.user as { id?: unknown; _id?: unknown } | undefined)?._id),
        parentId: normalizeTextId(record.parentId) || null,
        content: typeof record.content === "string" ? record.content : "",
        isSpoiler: Boolean(record.isSpoiler),
        createdAt: typeof record.createdAt === "string" ? record.createdAt : new Date().toISOString(),
        replies: nestedReplies
            .map((reply) => mapCommentNode(reply))
            .filter((reply): reply is ReviewComment => Boolean(reply)),
    };
}

function buildCommentTree(inputComments: ReviewComment[]) {
    const flattened: ReviewComment[] = [];
    const flatten = (nodes: ReviewComment[]) => {
        for (const node of nodes) {
            flattened.push({ ...node, replies: [] });

            if (node.replies.length > 0) {
                flatten(node.replies);
            }
        }
    };

    flatten(inputComments);

    const byId = new Map<string, ReviewComment>();
    const roots: ReviewComment[] = [];

    for (const raw of flattened) {
        byId.set(raw.id, { ...raw, replies: [...(raw.replies ?? [])] });
    }

    for (const comment of byId.values()) {
        if (comment.parentId && byId.has(comment.parentId)) {
            byId.get(comment.parentId)?.replies.push(comment);
            continue;
        }

        roots.push(comment);
    }

    const sortTree = (nodes: ReviewComment[]) => {
        nodes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        for (const node of nodes) {
            if (node.replies.length > 0) {
                sortTree(node.replies);
            }
        }
    };

    sortTree(roots);

    return roots;
}

function extractCommentsFromPayload(payload: unknown) {
    if (Array.isArray(payload)) {
        return buildCommentTree(
            payload
                .map((entry) => mapCommentNode(entry))
                .filter((entry): entry is ReviewComment => Boolean(entry))
        );
    }

    if (!payload || typeof payload !== "object") {
        return [];
    }

    const record = payload as Record<string, unknown>;
    const candidate = record.result ?? record.data ?? record.comments ?? record.items ?? record.results ?? record.list;

    if (Array.isArray(candidate)) {
        return buildCommentTree(
            candidate
                .map((entry) => mapCommentNode(entry))
                .filter((entry): entry is ReviewComment => Boolean(entry))
        );
    }

    const oneComment = mapCommentNode(candidate);
    return oneComment ? [oneComment] : [];
}

function countComments(nodes: ReviewComment[]): number {
    return nodes.reduce((count, node) => count + 1 + countComments(node.replies), 0);
}

type MovieDetailsClientProps = {
    movie: Movie;
    isAuthenticated: boolean;
    canSaveToLibrary: boolean;
    initialSaved: boolean;
    initialWatchlistId: string | null;
    currentUserId: string | null;
    hasUserReviewed?: boolean;
    loginHref: string;
};

export default function MovieDetailsClient({
    movie,
    isAuthenticated,
    canSaveToLibrary,
    initialSaved,
    initialWatchlistId,
    currentUserId,
    hasUserReviewed = false,
    loginHref,
}: MovieDetailsClientProps) {
    const router = useRouter();
    const [isSaved, setIsSaved] = useState(initialSaved);
    const [watchlistId, setWatchlistId] = useState<string | null>(initialWatchlistId);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [reviewFeedbackById, setReviewFeedbackById] = useState<Record<string, string | null>>({});
    const [reviewLikePendingById, setReviewLikePendingById] = useState<Record<string, boolean>>({});
    const [reviewLikeStateById, setReviewLikeStateById] = useState<Record<string, { liked: boolean; likesCount: number }>>(() => {
        const reviews = movie.reviews ?? [];

        return reviews.reduce<Record<string, { liked: boolean; likesCount: number }>>((acc, review) => {
            acc[review.id] = {
                liked: Boolean(review.likedByCurrentUser),
                likesCount: Number.isFinite(review.likesCount) ? Number(review.likesCount) : 0,
            };

            return acc;
        }, {});
    });


    console.log("Movies from review: ", movie)




    const [reviewCommentsById, setReviewCommentsById] = useState<Record<string, ReviewComment[]>>(() => {
        const reviews = movie.reviews ?? [];

        return reviews.reduce<Record<string, ReviewComment[]>>((acc, review) => {
            acc[review.id] = buildCommentTree((review.comments ?? []).map((comment) => ({
                ...comment,
                parentId: comment.parentId ?? null,
                replies: comment.replies ?? [],
            })));
            return acc;
        }, {});
    });
    const [commentDraftByReviewId, setCommentDraftByReviewId] = useState<Record<string, string>>({});
    const [replyDraftByCommentId, setReplyDraftByCommentId] = useState<Record<string, string>>({});
    const [activeReplyTargetByReviewId, setActiveReplyTargetByReviewId] = useState<Record<string, string | null>>({});
    const [commentPendingByReviewId, setCommentPendingByReviewId] = useState<Record<string, boolean>>({});
    const [commentFeedbackByReviewId, setCommentFeedbackByReviewId] = useState<Record<string, string | null>>({});
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
    const [isMutating, startTransition] = useTransition();

    const likedReviewsStorageKey = useMemo(() => {
        if (!currentUserId) {
            return null;
        }

        return `cinetube:liked-reviews:${currentUserId}:${movie.id}`;
    }, [currentUserId, movie.id]);

    useEffect(() => {
        if (!likedReviewsStorageKey) {
            return;
        }

        try {
            const raw = window.localStorage.getItem(likedReviewsStorageKey);
            if (!raw) {
                return;
            }

            const parsed = JSON.parse(raw) as unknown;
            const likedIds = Array.isArray(parsed) ? new Set(parsed.map((value) => String(value))) : new Set<string>();

            if (likedIds.size === 0) {
                return;
            }

            setReviewLikeStateById((prev) => {
                const next = { ...prev };

                for (const reviewId of likedIds) {
                    const current = next[reviewId] ?? { liked: false, likesCount: 0 };
                    next[reviewId] = {
                        liked: true,
                        likesCount: current.likesCount > 0 ? current.likesCount : 1,
                    };
                }

                return next;
            });
        } catch {
            // Ignore malformed localStorage values.
        }
    }, [likedReviewsStorageKey]);

    const persistLikedReview = (reviewId: string) => {
        if (!likedReviewsStorageKey) {
            return;
        }

        try {
            const raw = window.localStorage.getItem(likedReviewsStorageKey);
            const parsed = raw ? JSON.parse(raw) : [];
            const next = new Set(Array.isArray(parsed) ? parsed.map((value) => String(value)) : []);
            next.add(reviewId);
            window.localStorage.setItem(likedReviewsStorageKey, JSON.stringify(Array.from(next)));
        } catch {
            // Ignore localStorage write failures.
        }
    };

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

    const handleReviewLike = (reviewId: string) => {
        const currentState = reviewLikeStateById[reviewId] ?? { liked: false, likesCount: 0 };
        const isCurrentlyLiked = currentState.liked;

        if (!isAuthenticated) {
            setIsLoginPromptOpen(true);
            return;
        }

        if (!canSaveToLibrary) {
            setReviewFeedbackById((prev) => ({
                ...prev,
                [reviewId]: "Only user and premium_user accounts can react to reviews.",
            }));
            return;
        }

        setReviewFeedbackById((prev) => ({ ...prev, [reviewId]: null }));
        setReviewLikePendingById((prev) => ({ ...prev, [reviewId]: true }));
        setReviewLikeStateById((prev) => ({
            ...prev,
            [reviewId]: {
                liked: !isCurrentlyLiked,
                likesCount: isCurrentlyLiked ? Math.max(0, currentState.likesCount - 1) : currentState.likesCount + 1,
            },
        }));
        if (!isCurrentlyLiked) {
            persistLikedReview(reviewId);
        } else {
            // Optionally remove from localStorage if you want to persist unlikes
        }

        startTransition(async () => {
            try {
                const response = await fetch(`/api/reviews/${reviewId}/like`, {
                    method: isCurrentlyLiked ? "DELETE" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const payload = await response.json().catch(() => ({})) as { message?: string };

                if (!response.ok) {
                    if (response.status === 401) {
                        setIsLoginPromptOpen(true);
                    }
                    throw new Error(typeof payload.message === "string" ? payload.message : `Unable to ${isCurrentlyLiked ? "dislike" : "like"} this review.`);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : `Unable to ${isCurrentlyLiked ? "dislike" : "like"} this review.`;
                const normalizedMessage = message.toLowerCase();

                if (normalizedMessage.includes("already") && normalizedMessage.includes("like")) {
                    setReviewLikeStateById((prev) => ({
                        ...prev,
                        [reviewId]: {
                            liked: true,
                            likesCount: Math.max(currentState.likesCount, 1),
                        },
                    }));
                    persistLikedReview(reviewId);
                    setReviewFeedbackById((prev) => ({
                        ...prev,
                        [reviewId]: null,
                    }));
                    return;
                }

                setReviewLikeStateById((prev) => ({
                    ...prev,
                    [reviewId]: currentState,
                }));
                setReviewFeedbackById((prev) => ({
                    ...prev,
                    [reviewId]: message,
                }));
            } finally {
                setReviewLikePendingById((prev) => ({ ...prev, [reviewId]: false }));
            }
        });
    };

    const loadReviewComments = async (reviewId: string) => {
        const response = await fetch(`/api/user/comments/review/${reviewId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(typeof payload.message === "string" ? payload.message : "Unable to load comments.");
        }

        const nextComments = extractCommentsFromPayload(payload);

        setReviewCommentsById((prev) => ({
            ...prev,
            [reviewId]: nextComments,
        }));
    };

    const handleCommentSubmit = (reviewId: string, parentId?: string) => {
        const isReply = Boolean(parentId);
        const sourceText = isReply
            ? (parentId ? replyDraftByCommentId[parentId] : "")
            : commentDraftByReviewId[reviewId];
        const content = typeof sourceText === "string" ? sourceText.trim() : "";

        if (!isAuthenticated) {
            setIsLoginPromptOpen(true);
            return;
        }

        if (!canSaveToLibrary) {
            setCommentFeedbackByReviewId((prev) => ({
                ...prev,
                [reviewId]: "Only user and premium_user accounts can comment on reviews.",
            }));
            return;
        }

        if (!content) {
            setCommentFeedbackByReviewId((prev) => ({
                ...prev,
                [reviewId]: isReply ? "Reply text is required." : "Comment text is required.",
            }));
            return;
        }

        setCommentFeedbackByReviewId((prev) => ({ ...prev, [reviewId]: null }));
        setCommentPendingByReviewId((prev) => ({ ...prev, [reviewId]: true }));

        startTransition(async () => {
            try {
                const response = await fetch("/api/user/comments", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        reviewId,
                        userId: currentUserId,
                        content,
                        isSpoiler: false,
                        parentId: parentId ?? undefined,
                    }),
                });

                const payload = await response.json().catch(() => ({}));

                if (!response.ok) {
                    if (response.status === 401) {
                        setIsLoginPromptOpen(true);
                    }

                    throw new Error(typeof payload.message === "string" ? payload.message : "Unable to post comment.");
                }

                if (isReply && parentId) {
                    setReplyDraftByCommentId((prev) => ({ ...prev, [parentId]: "" }));
                    setActiveReplyTargetByReviewId((prev) => ({ ...prev, [reviewId]: null }));
                } else {
                    setCommentDraftByReviewId((prev) => ({ ...prev, [reviewId]: "" }));
                }

                try {
                    await loadReviewComments(reviewId);
                } catch {
                    const fallbackComment = extractCommentsFromPayload(payload)[0] ?? {
                        id: `local-${Date.now()}`,
                        userId: currentUserId ?? "me",
                        parentId: parentId ?? null,
                        content,
                        isSpoiler: false,
                        createdAt: new Date().toISOString(),
                        replies: [],
                    };

                    setReviewCommentsById((prev) => {
                        const nextFlat = [...(prev[reviewId] ?? []), fallbackComment];
                        return {
                            ...prev,
                            [reviewId]: buildCommentTree(nextFlat),
                        };
                    });
                }
            } catch (error) {
                setCommentFeedbackByReviewId((prev) => ({
                    ...prev,
                    [reviewId]: error instanceof Error ? error.message : "Unable to post comment.",
                }));
            } finally {
                setCommentPendingByReviewId((prev) => ({ ...prev, [reviewId]: false }));
            }
        });
    };



    const renderCommentList = (reviewId: string, comments: ReviewComment[], depth = 0): ReactElement => {
        return (
            <div className="space-y-3">
                {comments.map((comment) => (
                    <div key={comment.id} className={cn("space-y-2", depth > 0 && "ml-6 border-l border-slate-200 pl-4")}>
                        <div className="flex items-start gap-3">
                            <Avatar className="h-7 w-7 border border-slate-200">
                                <AvatarFallback className="text-[10px]">
                                    {(comment.userId || "U").slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-xs font-semibold">{shortId(comment.userId || "unknown")}</p>
                                    <p className="text-xs text-slate-500">{formatLongDate(comment.createdAt)}</p>
                                    {comment.isSpoiler && (
                                        <Badge variant="secondary" className="rounded-full text-[10px]">spoiler</Badge>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-slate-700">{comment.content}</p>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="mt-1 h-7 px-2 text-xs text-slate-600"
                                    onClick={() => {
                                        if (!isAuthenticated) {
                                            setIsLoginPromptOpen(true);
                                            return;
                                        }

                                        setActiveReplyTargetByReviewId((prev) => ({
                                            ...prev,
                                            [reviewId]: prev[reviewId] === comment.id ? null : comment.id,
                                        }));
                                    }}
                                >
                                    <Reply className="mr-1 size-3" />
                                    Reply
                                </Button>

                                {activeReplyTargetByReviewId[reviewId] === comment.id ? (
                                    <div className="mt-2 space-y-2">
                                        <textarea
                                            value={replyDraftByCommentId[comment.id] ?? ""}
                                            onChange={(event) => {
                                                const nextValue = event.target.value;
                                                setReplyDraftByCommentId((prev) => ({ ...prev, [comment.id]: nextValue }));
                                            }}
                                            rows={2}
                                            placeholder="Write a reply..."
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300"
                                        />
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="h-8"
                                                disabled={Boolean(commentPendingByReviewId[reviewId])}
                                                onClick={() => handleCommentSubmit(reviewId, comment.id)}
                                            >
                                                Post Reply
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="h-8"
                                                onClick={() => setActiveReplyTargetByReviewId((prev) => ({ ...prev, [reviewId]: null }))}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {comment.replies.length > 0 ? renderCommentList(reviewId, comment.replies, depth + 1) : null}
                    </div>
                ))}
            </div>
        );
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
                                    className={cn(
                                        "gap-2 border border-white/20 bg-white/10 text-white hover:bg-white/20",
                                        hasUserReviewed && "cursor-not-allowed opacity-60"
                                    )}
                                    onClick={!hasUserReviewed ? handleProtectedSave : undefined}
                                    disabled={isMutating || hasUserReviewed}
                                >
                                    <Heart className={cn("size-4", (isSaved || hasUserReviewed) && "fill-rose-500 text-rose-500")} />
                                    {hasUserReviewed ? "Already Watched" : isMutating ? actionLabel : isSaved ? "Favorited" : "Favorite"}
                                </Button>
                                <Button
                                    variant="secondary"
                                    className={cn(
                                        "gap-2 border border-white/20 bg-white/10 text-white hover:bg-white/20",
                                        hasUserReviewed && "cursor-not-allowed opacity-60"
                                    )}
                                    onClick={!hasUserReviewed ? handleProtectedSave : undefined}
                                    disabled={isMutating || hasUserReviewed}
                                >
                                    <Bookmark className={cn("size-4", (isSaved || hasUserReviewed) && "fill-sky-400 text-sky-400")} />
                                    {hasUserReviewed ? "In Your Watchlist" : isMutating ? actionLabel : isSaved ? "In Watchlist" : "Add to Watchlist"}
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

                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleReviewLike(review.id)}
                                            disabled={Boolean(reviewLikePendingById[review.id])}
                                            className={cn(
                                                "h-8 gap-2 rounded-full",
                                                reviewLikeStateById[review.id]?.liked && "border-emerald-200 bg-emerald-50 text-emerald-700"
                                            )}
                                        >
                                            <ThumbsUp
                                                className={cn(
                                                    "size-4",
                                                    reviewLikeStateById[review.id]?.liked && "fill-emerald-600 text-emerald-600"
                                                )}
                                            />
                                            {reviewLikeStateById[review.id]?.liked ? "Dislike" : "Like"}
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                                                {reviewLikeStateById[review.id]?.likesCount ?? 0}
                                            </span>
                                        </Button>

                                        {reviewFeedbackById[review.id] ? (
                                            <p className="text-xs text-red-600">{reviewFeedbackById[review.id]}</p>
                                        ) : null}
                                    </div>

                                    {review.tags.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {review.tags.map((tag) => (
                                                <Badge key={tag} variant="outline" className="rounded-full text-xs">
                                                    #{tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        {(() => {
                                            const comments = reviewCommentsById[review.id] ?? [];
                                            const totalComments = countComments(comments);

                                            return (
                                                <>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                                                            <MessageCircle className="size-3.5" />
                                                            {totalComments} Comment{totalComments === 1 ? "" : "s"}
                                                        </p>
                                                    </div>

                                                    <div className="mt-3 space-y-2">
                                                        {isAuthenticated ? (
                                                            <>
                                                                <textarea
                                                                    value={commentDraftByReviewId[review.id] ?? ""}
                                                                    onChange={(event) => {
                                                                        const nextValue = event.target.value;
                                                                        setCommentDraftByReviewId((prev) => ({
                                                                            ...prev,
                                                                            [review.id]: nextValue,
                                                                        }));
                                                                    }}
                                                                    rows={3}
                                                                    placeholder="Write a comment on this review..."
                                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300"
                                                                />
                                                                <div className="flex items-center gap-2">
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        className="h-8"
                                                                        disabled={Boolean(commentPendingByReviewId[review.id])}
                                                                        onClick={() => handleCommentSubmit(review.id)}
                                                                    >
                                                                        Post Comment
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                                                Log in first to add comments or replies.
                                                                <Button
                                                                    type="button"
                                                                    variant="link"
                                                                    className="ml-1 h-auto p-0 text-sm"
                                                                    onClick={() => setIsLoginPromptOpen(true)}
                                                                >
                                                                    Login now
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {commentFeedbackByReviewId[review.id] ? (
                                                            <p className="text-xs text-red-600">{commentFeedbackByReviewId[review.id]}</p>
                                                        ) : null}
                                                    </div>

                                                    <div className="mt-3">
                                                        {comments.length > 0 ? (
                                                            renderCommentList(review.id, comments)
                                                        ) : (
                                                            <p className="text-sm text-slate-500">No comments yet.</p>
                                                        )}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </motion.article>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </section>
        </div>
    );
}
