/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState, useTransition, type ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    User,
    Film,
    Users,
    Award,
    TrendingUp,
    Eye,
    BookOpen,
    ChevronDown,
    ChevronUp,
    Send,
    MoreHorizontal,
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
    userName?: string;
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

function formatRelativeDate(value: string) {
    const date = new Date(value);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
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
        userName: typeof (record.user as { name?: unknown } | undefined)?.name === "string"
            ? ((record.user as { name?: string }).name ?? "").trim() || undefined
            : undefined,
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
    const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null);
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

    const fetchReviewLikesCount = async (reviewId: string): Promise<number> => {
        try {
            const res = await fetch(`/api/reviews/${reviewId}/likes`, { method: "GET" });
            const data = await res.json();
            if (res.ok && typeof data.result === "number") {
                return data.result;
            }
        } catch { }
        return 0;
    };

    useEffect(() => {
        const reviews = movie.reviews ?? [];
        const updateCounts = async () => {
            const updates: Record<string, { liked: boolean; likesCount: number }> = {};
            await Promise.all(reviews.map(async (r) => {
                const count = await fetchReviewLikesCount(r.id);
                updates[r.id] = {
                    liked: Boolean(r.likedByCurrentUser),
                    likesCount: count,
                };
            }));
            setReviewLikeStateById((prev) => {
                const next = { ...prev };
                for (const review of reviews) {
                    const existing = prev[review.id];
                    next[review.id] = {
                        liked: existing?.liked ?? Boolean(review.likedByCurrentUser),
                        likesCount: updates[review.id]?.likesCount ?? existing?.likesCount ?? 0,
                    };
                }
                return next;
            });
        };
        updateCounts();
    }, [movie.reviews]);

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
    const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

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

    useEffect(() => {
        if (!feedbackMessage) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setFeedbackMessage(null);
            setFeedbackType(null);
        }, 4000);

        return () => window.clearTimeout(timeoutId);
    }, [feedbackMessage]);

    const handleProtectedSave = () => {
        if (!isAuthenticated) {
            setIsLoginPromptOpen(true);
            return;
        }

        if (!canSaveToLibrary) {
            setFeedbackMessage("Only user and premium_user accounts can save movies to the dashboard.");
            setFeedbackType("error");
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
                    ? "✨ Saved to your watchlist! It will appear in your dashboard."
                    : "Removed from your watchlist dashboard.");
                setFeedbackType("success");
            } catch (error) {
                setFeedbackMessage(error instanceof Error ? error.message : "Unable to update watchlist.");
                setFeedbackType("error");
            }
        });
    };

    const handleReviewLike = (reviewId: string) => {
        const cur = reviewLikeStateById[reviewId] ?? { liked: false, likesCount: 0 };
        const isCurrentlyLiked = cur.liked;

        if (!isAuthenticated) { setIsLoginPromptOpen(true); return; }

        setReviewFeedbackById((prev) => ({ ...prev, [reviewId]: null }));
        setReviewLikePendingById((prev) => ({ ...prev, [reviewId]: true }));
        setReviewLikeStateById((prev) => ({
            ...prev,
            [reviewId]: {
                liked: !isCurrentlyLiked,
                likesCount: isCurrentlyLiked ? Math.max(0, cur.likesCount - 1) : cur.likesCount + 1,
            },
        }));

        if (!isCurrentlyLiked) {
            persistLikedReview(reviewId);
        }

        startTransition(async () => {
            try {
                const res = await fetch(`/api/reviews/${reviewId}/${isCurrentlyLiked ? "dislike" : "like"}`, {
                    method: isCurrentlyLiked ? "DELETE" : "POST",
                    headers: { "Content-Type": "application/json" },
                });

                const payload = await res.json().catch(() => ({})) as { message?: string };
                if (!res.ok) {
                    if (res.status === 401) { setIsLoginPromptOpen(true); }
                    throw new Error(typeof payload.message === "string" ? payload.message : `Unable to ${isCurrentlyLiked ? "dislike" : "like"}.`);
                }
            } catch (error) {
                const msg = error instanceof Error ? error.message : `Unable to ${isCurrentlyLiked ? "dislike" : "like"}.`;
                const normalizedMessage = String(msg).toLowerCase();

                if (!isCurrentlyLiked && normalizedMessage.includes("already") && normalizedMessage.includes("like")) {
                    setReviewLikeStateById((prev) => ({
                        ...prev,
                        [reviewId]: {
                            liked: true,
                            likesCount: Math.max(cur.likesCount, 1),
                        },
                    }));
                    persistLikedReview(reviewId);
                    setReviewFeedbackById((prev) => ({ ...prev, [reviewId]: null }));
                    return;
                }

                setReviewLikeStateById((prev) => ({ ...prev, [reviewId]: cur }));
                setReviewFeedbackById((prev) => ({ ...prev, [reviewId]: msg }));
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

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        const reviewIds = (movie.reviews ?? []).map((review) => review.id).filter(Boolean);
        if (reviewIds.length === 0) {
            return;
        }

        let cancelled = false;

        void (async () => {
            await Promise.all(reviewIds.map(async (reviewId) => {
                try {
                    const response = await fetch(`/api/user/comments/review/${reviewId}`, { cache: "no-store" });
                    const payload = await response.json().catch(() => ({}));
                    if (cancelled || !response.ok) {
                        return;
                    }

                    const extracted = extractCommentsFromPayload(payload);
                    setReviewCommentsById((prev) => ({ ...prev, [reviewId]: extracted }));
                } catch {
                    // Keep existing comments if fetch fails.
                }
            }));
        })();

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, movie.reviews]);

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
            <AnimatePresence>
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className={cn("space-y-2", depth > 0 && "ml-8 border-l-2 border-gradient-to-r from-purple-200 to-pink-200 pl-5")}
                        >
                            <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8 ring-2 ring-white shadow-md">
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-[10px] text-white">
                                        {(comment.userName || comment.userId || "U").slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <p className="text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                                            {shortId(comment.userName || comment.userId || "unknown")}
                                        </p>
                                        <p className="text-xs text-gray-400">{formatRelativeDate(comment.createdAt)}</p>
                                        {comment.isSpoiler && (
                                            <Badge variant="secondary" className="rounded-full text-[10px] bg-yellow-100 text-yellow-800">
                                                ⚠️ spoiler
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="mt-2 h-7 px-3 text-xs text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full"
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
                                        <Reply className="mr-1.5 size-3" />
                                        Reply
                                    </Button>

                                    <AnimatePresence>
                                        {activeReplyTargetByReviewId[reviewId] === comment.id && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="mt-3 space-y-2"
                                            >
                                                <textarea
                                                    value={replyDraftByCommentId[comment.id] ?? ""}
                                                    onChange={(event) => {
                                                        const nextValue = event.target.value;
                                                        setReplyDraftByCommentId((prev) => ({ ...prev, [comment.id]: nextValue }));
                                                    }}
                                                    rows={2}
                                                    placeholder="Write a reply..."
                                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        className="h-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-4"
                                                        disabled={Boolean(commentPendingByReviewId[reviewId])}
                                                        onClick={() => handleCommentSubmit(reviewId, comment.id)}
                                                    >
                                                        <Send className="mr-1.5 size-3" />
                                                        Post Reply
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 rounded-full"
                                                        onClick={() => setActiveReplyTargetByReviewId((prev) => ({ ...prev, [reviewId]: null }))}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {comment.replies.length > 0 && renderCommentList(reviewId, comment.replies, depth + 1)}
                        </motion.div>
                    ))}
                </div>
            </AnimatePresence>
        );
    };

    const toggleReviewExpansion = (reviewId: string) => {
        setExpandedReviews(prev => {
            const newSet = new Set(prev);
            if (newSet.has(reviewId)) {
                newSet.delete(reviewId);
            } else {
                newSet.add(reviewId);
            }
            return newSet;
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <AnimatePresence>
                {feedbackMessage ? (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-2xl ring-1 ring-slate-200"
                        style={{
                            backgroundColor: feedbackType === "success" ? "#ecfdf5" : "#fef2f2",
                            color: feedbackType === "success" ? "#166534" : "#991b1b",
                        }}
                    >
                        {feedbackMessage}
                    </motion.div>
                ) : null}

                {/* Login Modal */}
                {isLoginPromptOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="login-required-title"
                        onClick={() => setIsLoginPromptOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <User className="h-8 w-8 text-white" />
                                </div>
                                <h2 id="login-required-title" className="text-2xl font-bold text-gray-900">
                                    Ready to join the conversation?
                                </h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Sign in to save movies to your watchlist, leave reviews, and connect with other movie enthusiasts.
                                </p>
                            </div>

                            <div className="mt-8 flex flex-col gap-3">
                                <Button
                                    type="button"
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full py-6 text-base font-semibold"
                                    onClick={() => router.push(loginHref)}
                                >
                                    Sign In / Sign Up
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full py-6 text-base"
                                    onClick={() => setIsLoginPromptOpen(false)}
                                >
                                    Maybe Later
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={movie.backdropPath || movie.posterPath}
                        alt={movie.title}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <Button
                        variant="secondary"
                        onClick={() => router.back()}
                        className="mb-8 gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 rounded-full"
                    >
                        <ArrowLeft className="size-4" />
                        Back
                    </Button>

                    <div className="grid gap-10 md:grid-cols-[320px_minmax(0,1fr)] lg:grid-cols-[360px_minmax(0,1fr)]">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="sticky top-24 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20">
                                <img src={movie.posterPath} alt={movie.title} className="h-full w-full object-cover" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="space-y-6"
                        >
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">{movie.title}</h1>
                                    <span className="text-3xl text-gray-300">({year})</span>
                                </div>
                                {movie.tagline && (
                                    <p className="text-lg italic text-gray-300 border-l-2 border-purple-500 pl-4">{movie.tagline}</p>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                                <div className="flex items-center gap-2">
                                    <Calendar className="size-4" />
                                    <span>{formatLongDate(movie.releaseDate)}</span>
                                </div>
                                <div className="w-1 h-1 bg-gray-500 rounded-full" />
                                <div className="flex items-center gap-2">
                                    <Film className="size-4" />
                                    <span>{movie.genre.length > 0 ? movie.genre.slice(0, 3).join(", ") : "Genres coming soon"}</span>
                                </div>
                                <div className="w-1 h-1 bg-gray-500 rounded-full" />
                                <div className="flex items-center gap-2">
                                    <Globe className="size-4" />
                                    <span>{movie.language}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <div className="bg-white/10 backdrop-blur-md rounded-xl px-5 py-3 border border-white/20">
                                    <p className="text-xs uppercase tracking-wider text-gray-300">Rating</p>
                                    <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold text-white">
                                        <Star className="size-5 fill-yellow-400 text-yellow-400" />
                                        {movie.rating.toFixed(1)}/5
                                    </p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl px-5 py-3 border border-white/20">
                                    <p className="text-xs uppercase tracking-wider text-gray-300">Votes</p>
                                    <p className="mt-1 text-2xl font-bold text-white">{movie.votes.toLocaleString()}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl px-5 py-3 border border-white/20">
                                    <p className="text-xs uppercase tracking-wider text-gray-300">Reviews</p>
                                    <p className="mt-1 text-2xl font-bold text-white">{approvedCount}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button
                                    className={cn(
                                        "gap-2 rounded-full px-6 py-5 font-semibold transition-all transform hover:scale-105",
                                        isSaved
                                            ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white"
                                            : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/30"
                                    )}
                                    onClick={handleProtectedSave}
                                    disabled={isMutating || hasUserReviewed}
                                >
                                    <Heart className={cn("size-5", isSaved && "fill-white")} />
                                    {hasUserReviewed ? "Already Watched" : isMutating ? actionLabel : isSaved ? "Favorited" : "Favorite"}
                                </Button>
                                <Button
                                    className={cn(
                                        "gap-2 rounded-full px-6 py-5 font-semibold transition-all transform hover:scale-105",
                                        isSaved
                                            ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white"
                                            : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/30"
                                    )}
                                    onClick={handleProtectedSave}
                                    disabled={isMutating || hasUserReviewed}
                                >
                                    <Bookmark className={cn("size-5", isSaved && "fill-white")} />
                                    {hasUserReviewed ? "In Your Watchlist" : isMutating ? actionLabel : isSaved ? "In Watchlist" : "Add to Watchlist"}
                                </Button>
                            </div>

                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <Tabs defaultValue="overview" className="space-y-8">
                    <TabsList className="h-auto flex-wrap justify-start gap-2 bg-white/50 backdrop-blur-md rounded-2xl p-2 border border-gray-200 shadow-sm">
                        <TabsTrigger value="overview" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                            <Film className="mr-2 size-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="cast" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                            <Users className="mr-2 size-4" />
                            Cast & Crew
                        </TabsTrigger>
                        <TabsTrigger value="reviews" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                            <MessageCircle className="mr-2 size-4" />
                            Reviews
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-8">
                        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
                            >
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
                                    <BookOpen className="size-6 text-purple-600" />
                                    Synopsis
                                </h2>
                                <p className="mt-4 leading-relaxed text-gray-700 text-lg">
                                    {movie.overview || "No overview available yet."}
                                </p>

                                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                                    {movie.ageGroup && (
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                                            <p className="text-xs uppercase tracking-wider text-purple-600 font-semibold">Age Group</p>
                                            <p className="mt-1 text-lg font-bold text-gray-800">{movie.ageGroup}</p>
                                        </div>
                                    )}
                                    {movie.priceType && (
                                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
                                            <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold">Price Type</p>
                                            <p className="mt-1 text-lg font-bold text-gray-800">{movie.priceType}</p>
                                        </div>
                                    )}
                                </div>

                                {movie.director && (
                                    <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
                                        <p className="text-xs uppercase tracking-wider text-amber-600 font-semibold">Director</p>
                                        <p className="mt-1 text-lg font-bold text-gray-800">{movie.director.name}</p>
                                    </div>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="space-y-6"
                            >
                                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold flex items-center gap-2">
                                        <Award className="size-4 text-purple-600" />
                                        Genres
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {movie.genre.length > 0 ? (
                                            movie.genre.map((item) => (
                                                <Badge key={item} className="rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-none px-3 py-1">
                                                    {item}
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">No genres available.</p>
                                        )}
                                    </div>
                                </div>

                                {movie.certification && (
                                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                                        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Certification</p>
                                        <p className="mt-1 text-lg font-bold text-gray-800">{movie.certification}</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </TabsContent>

                    <TabsContent value="cast" className="space-y-6">
                        {movie.cast && movie.cast.length > 0 ? (
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {movie.cast.map((actor, index) => (
                                    <motion.div
                                        key={`${actor.name}-${index}`}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -5 }}
                                        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
                                    >
                                        <div className="p-5 flex items-center gap-4">
                                            <Avatar className="h-14 w-14 ring-4 ring-purple-100">
                                                <AvatarImage src={actor.avatar} alt={actor.name} />
                                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg">
                                                    {actor.name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-800 truncate">{actor.name}</p>
                                                <p className="text-sm text-gray-500 truncate">{actor.character || "Role unknown"}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Cast and crew details are not available yet.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="reviews" className="space-y-6">
                        {!movie.reviews || movie.reviews.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white rounded-2xl shadow-xl p-12 text-center"
                            >
                                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No reviews yet.</p>
                                <p className="text-gray-400 mt-2">Be the first to share your thoughts!</p>
                            </motion.div>
                        ) : (
                            movie.reviews.map((review, index) => {
                                const comments = reviewCommentsById[review.id] ?? [];
                                const totalComments = countComments(comments);
                                const isExpanded = expandedReviews.has(review.id);
                                const reviewContent = review.content;
                                const shouldTruncate = reviewContent.length > 300 && !isExpanded;

                                return (
                                    <motion.article
                                        key={review.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                                    >
                                        <div className="p-6">
                                            {/* Review Header */}
                                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-12 w-12 ring-2 ring-purple-100">
                                                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                                            {review.userId.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{shortId(review.userId)}</p>
                                                        <p className="text-xs text-gray-400">{formatRelativeDate(review.createdAt)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full">
                                                        <Star className="size-4 fill-amber-500 text-amber-500" />
                                                        <span className="font-semibold text-amber-700">{review.rating}/5</span>
                                                    </div>
                                                    <Badge
                                                        className={cn(
                                                            "rounded-full px-3 py-1",
                                                            review.status === "APPROVED"
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                : "bg-gray-50 text-gray-600 border-gray-200"
                                                        )}
                                                    >
                                                        {review.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Spoiler Warning */}
                                            {review.isSpoiler && (
                                                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-2">
                                                    <Sparkles className="size-4 text-yellow-600" />
                                                    <p className="text-sm text-yellow-800">This review may contain spoilers.</p>
                                                </div>
                                            )}

                                            {/* Review Content */}
                                            <div className="mb-4">
                                                <p className="text-gray-700 leading-relaxed">
                                                    {shouldTruncate ? `${reviewContent.slice(0, 300)}...` : reviewContent}
                                                </p>
                                                {reviewContent.length > 300 && (
                                                    <button
                                                        onClick={() => toggleReviewExpansion(review.id)}
                                                        className="mt-2 text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                                    >
                                                        {isExpanded ? (
                                                            <>Show less <ChevronUp className="size-4" /></>
                                                        ) : (
                                                            <>Read more <ChevronDown className="size-4" /></>
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Tags */}
                                            {review.tags.length > 0 && (
                                                <div className="mb-4 flex flex-wrap gap-2">
                                                    {review.tags.map((tag) => (
                                                        <Badge key={tag} variant="outline" className="rounded-full text-xs border-gray-200 bg-gray-50">
                                                            #{tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Like and Comment Actions */}
                                            <div className="flex items-center gap-3 mb-6 pt-2 border-t border-gray-100">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleReviewLike(review.id)}
                                                    disabled={Boolean(reviewLikePendingById[review.id])}
                                                    className={cn(
                                                        "h-9 gap-2 rounded-full px-4 transition-all",
                                                        reviewLikeStateById[review.id]?.liked && "border-emerald-300 bg-emerald-50 text-emerald-700"
                                                    )}
                                                >
                                                    <ThumbsUp
                                                        className={cn(
                                                            "size-4",
                                                            reviewLikeStateById[review.id]?.liked && "fill-emerald-600 text-emerald-600"
                                                        )}
                                                    />
                                                    <span className="font-medium">
                                                        {reviewLikeStateById[review.id]?.liked ? "Liked" : "Like"}
                                                    </span>
                                                    <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                                                        {reviewLikeStateById[review.id]?.likesCount ?? 0}
                                                    </span>
                                                </Button>

                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <MessageCircle className="size-4" />
                                                    <span className="text-sm font-medium">{totalComments}</span>
                                                    <span className="text-xs">comments</span>
                                                </div>
                                            </div>

                                            {/* Comments Section */}
                                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5">
                                                <div className="mb-4">
                                                    {isAuthenticated ? (
                                                        <div className="space-y-3">
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
                                                                placeholder="Share your thoughts on this review..."
                                                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all"
                                                            />
                                                            <div className="flex justify-end">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    className="h-9 rounded-full px-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                                                    disabled={Boolean(commentPendingByReviewId[review.id])}
                                                                    onClick={() => handleCommentSubmit(review.id)}
                                                                >
                                                                    <Send className="mr-1.5 size-3.5" />
                                                                    Post Comment
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                                                            <p className="text-sm text-gray-600">Log in to join the conversation!</p>
                                                            <Button
                                                                type="button"
                                                                variant="link"
                                                                className="mt-1 text-purple-600"
                                                                onClick={() => setIsLoginPromptOpen(true)}
                                                            >
                                                                Sign In Now
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {commentFeedbackByReviewId[review.id] && (
                                                        <p className="mt-2 text-xs text-red-500">{commentFeedbackByReviewId[review.id]}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {comments.length > 0 ? (
                                                        renderCommentList(review.id, comments)
                                                    ) : (
                                                        <div className="text-center py-8">
                                                            <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                                            <p className="text-sm text-gray-400">No comments yet. Start the discussion!</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.article>
                                );
                            })
                        )}
                    </TabsContent>
                </Tabs>
            </section>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #a855f7, #ec4899);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #9333ea, #db2777);
                }
            `}</style>
        </div>
    );
}