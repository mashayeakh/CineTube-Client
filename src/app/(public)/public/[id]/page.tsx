/* eslint-disable @typescript-eslint/no-explicit-any */
import { Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import MovieDetailsClient from './MovieDetailsClient';
import { getMovieById } from '../_actions/movie';
import { getGenres } from '../_actions/genres';
import { resolveMediaUrl } from '@/lib/media';
import { extractArray, findValue } from '@/lib/user-dashboard.utils';
import { getUserInfo } from '@/service/auth.services';
import { getMyWatchlists } from '@/service/watchlist.services';

type GenreOption = {
    id: string;
    name: string;
};

function extractGenreNames(rawGenres: unknown, genreOptions: GenreOption[]) {
    const genreMap = new Map(genreOptions.map((genre) => [genre.id, genre.name]));
    const names = new Set<string>();

    const addName = (value: unknown) => {
        if (typeof value === 'string') {
            const trimmed = value.trim();

            if (!trimmed) {
                return;
            }

            if (genreMap.has(trimmed)) {
                names.add(genreMap.get(trimmed) as string);
                return;
            }

            names.add(trimmed);
        }
    };

    if (typeof rawGenres === 'string') {
        try {
            const parsed = JSON.parse(rawGenres);
            return extractGenreNames(parsed, genreOptions);
        } catch {
            addName(rawGenres);
        }
    }

    if (Array.isArray(rawGenres)) {
        for (const item of rawGenres) {
            if (typeof item === 'string') {
                addName(item);
                continue;
            }

            if (item && typeof item === 'object') {
                const record = item as { id?: unknown; name?: unknown };

                if (typeof record.name === 'string') {
                    addName(record.name);
                } else if (typeof record.id === 'string') {
                    addName(record.id);
                }
            }
        }
    }

    return Array.from(names);
}

function normalizeId(value: unknown) {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : "";
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }

    return "";
}

function parseReactionEntries(source: unknown) {
    if (Array.isArray(source)) {
        return source;
    }

    if (typeof source === "string") {
        try {
            const parsed = JSON.parse(source);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    if (source && typeof source === "object") {
        const record = source as Record<string, unknown>;
        const candidate = record.items ?? record.data ?? record.results ?? record.list;
        return Array.isArray(candidate) ? candidate : [];
    }

    return [] as unknown[];
}

function parseReactionCount(source: unknown) {
    if (Array.isArray(source)) {
        return source.length;
    }

    if (typeof source === "number" && Number.isFinite(source)) {
        return source;
    }

    if (typeof source === "string") {
        const parsedNumber = Number(source);

        if (Number.isFinite(parsedNumber)) {
            return parsedNumber;
        }

        try {
            const parsedJson = JSON.parse(source);
            return parseReactionCount(parsedJson);
        } catch {
            return 0;
        }
    }

    if (source && typeof source === "object") {
        const record = source as Record<string, unknown>;
        const directCandidates = [
            record.count,
            record.total,
            record.length,
            record.likesCount,
            record.likeCount,
            record.dislikesCount,
            record.dislikeCount,
        ];

        for (const candidate of directCandidates) {
            const nextCount = parseReactionCount(candidate);

            if (nextCount > 0) {
                return nextCount;
            }
        }

        const nestedCandidates = [record.items, record.data, record.results, record.list];

        for (const candidate of nestedCandidates) {
            const nextCount = parseReactionCount(candidate);

            if (nextCount > 0) {
                return nextCount;
            }
        }
    }

    return 0;
}

function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Film className="size-16 mx-auto mb-4 text-muted-foreground" />
                <h1 className="text-2xl font-bold mb-2">Movie Not Found</h1>
                <p className="text-muted-foreground mb-4">The movie you are looking for does not exist.</p>
                <Button>
                    <Link href="/popular">Browse Movies</Link>
                </Button>
            </div>
        </div>
    );
}

export default async function MovieDetails({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    noStore();

    const { id } = await params;

    let data: any;
    let genreOptions: GenreOption[] = [];
    let currentUser: Record<string, unknown> | null = null;
    let watchlistPayload: unknown = null;
    try {
        const [movieData, genresData, userData] = await Promise.all([
            getMovieById(id),
            getGenres(),
            getUserInfo().catch(() => null),
        ]);

        data = movieData;
        genreOptions = Array.isArray(genresData) ? genresData as GenreOption[] : [];
        currentUser = userData as Record<string, unknown> | null;
    } catch {
        return <NotFound />;
    }

    if (!data) return <NotFound />;

    // Parse cast from JSON string if needed
    let castArray: { name: string; character: string }[] = [];
    try {
        const parsed = JSON.parse(data.cast ?? '[]');
        if (Array.isArray(parsed)) {
            castArray = parsed.map((name: string) => ({ name, character: '' }));
        }
    } catch {
        castArray = [];
    }

    const approvedReviews = (data.reviews ?? []).filter((r: any) => r.status === 'APPROVED');
    const avgRating =
        approvedReviews.length > 0
            ? Number(
                (
                    approvedReviews.reduce((sum: number, r: any) => sum + Number(r.rating ?? 0), 0) /
                    approvedReviews.length
                ).toFixed(1)
            )
            : 0;

    const currentUserId = normalizeId(findValue(currentUser, ["id", "_id", "userId"]));

    // Parse tags for each review — only show APPROVED reviews on the public page
    const mappedReviews = approvedReviews.map((r: any) => {
        let tags: string[] = [];
        try {
            const parsed = JSON.parse(r.tags ?? '[]');
            if (Array.isArray(parsed)) tags = parsed;
        } catch { tags = []; }

        const likesArray = parseReactionEntries(r.likes ?? r.likedBy ?? r.reviewLikes);

        const dislikesArray = parseReactionEntries(r.dislikes ?? r.dislikedBy ?? r.reviewDislikes);

        const likedByCurrentUser = Boolean(
            currentUserId && likesArray.some((entry: any) => {
                const entryId = normalizeId(entry);

                if (entryId) {
                    return entryId === currentUserId;
                }

                if (!entry || typeof entry !== "object") {
                    return false;
                }

                return (
                    normalizeId(entry.userId) === currentUserId ||
                    normalizeId(entry.id) === currentUserId ||
                    normalizeId(entry._id) === currentUserId ||
                    normalizeId(entry.user?.id) === currentUserId ||
                    normalizeId(entry.user?._id) === currentUserId ||
                    normalizeId(entry.user?.userId) === currentUserId
                );
            })
        );

        const dislikedByCurrentUser = Boolean(
            currentUserId && dislikesArray.some((entry: any) => {
                const entryId = normalizeId(entry);

                if (entryId) {
                    return entryId === currentUserId;
                }

                if (!entry || typeof entry !== "object") {
                    return false;
                }

                return (
                    normalizeId(entry.userId) === currentUserId ||
                    normalizeId(entry.id) === currentUserId ||
                    normalizeId(entry._id) === currentUserId ||
                    normalizeId(entry.user?.id) === currentUserId ||
                    normalizeId(entry.user?._id) === currentUserId ||
                    normalizeId(entry.user?.userId) === currentUserId
                );
            })
        );

        const reactionEntries = parseReactionEntries(r.reactions ?? r.reviewReactions ?? r.reaction ?? r.activity);

        const reactionLikeCount = reactionEntries.filter((entry: any) => {
            if (!entry || typeof entry !== "object") {
                return false;
            }

            const type = normalizeId(entry.type ?? entry.reactionType ?? entry.action).toUpperCase();
            return type === "LIKE" || type === "UPVOTE";
        }).length;

        const reactionDislikeCount = reactionEntries.filter((entry: any) => {
            if (!entry || typeof entry !== "object") {
                return false;
            }

            const type = normalizeId(entry.type ?? entry.reactionType ?? entry.action).toUpperCase();
            return type === "DISLIKE" || type === "DOWNVOTE";
        }).length;

        const parsedLikeCount = Math.max(
            parseReactionCount(r.likesCount),
            parseReactionCount(r.likeCount),
            parseReactionCount(r.totalLikes),
            parseReactionCount(r.likes),
            parseReactionCount(r.likedBy),
            parseReactionCount(r.reviewLikes),
            likesArray.length,
            reactionLikeCount
        );

        const parsedDislikeCount = Math.max(
            parseReactionCount(r.dislikesCount),
            parseReactionCount(r.dislikeCount),
            parseReactionCount(r.totalDislikes),
            parseReactionCount(r.dislikes),
            parseReactionCount(r.dislikedBy),
            parseReactionCount(r.reviewDislikes),
            dislikesArray.length,
            reactionDislikeCount
        );

        const mapCommentNode = (c: any) => {
            const nestedReplies = Array.isArray(c?.replies) ? c.replies : [];

            return {
                id: String(c?.id ?? ""),
                userId: String(c?.userId ?? c?.user?.id ?? c?.user?._id ?? ""),
                content: typeof c?.content === "string" ? c.content : "",
                isSpoiler: Boolean(c?.isSpoiler),
                createdAt: typeof c?.createdAt === "string" ? c.createdAt : "",
                parentId: typeof c?.parentId === "string" ? c.parentId : null,
                replies: nestedReplies.map(mapCommentNode),
            };
        };

        const rawComments = Array.isArray(r.comments)
            ? r.comments
            : Array.isArray(r.comment)
                ? r.comment
                : [];

        return {
            id: r.id as string,
            userId: r.userId as string,
            rating: Number(r.rating ?? 0),
            content: (r.content as string) ?? '',
            isSpoiler: Boolean(r.isSpoiler),
            tags,
            status: (r.status as string) ?? '',
            createdAt: (r.createdAt as string) ?? '',
            likesCount: Number.isFinite(parsedLikeCount) ? parsedLikeCount : 0,
            likedByCurrentUser: likedByCurrentUser || Boolean(r.isLikedByCurrentUser ?? r.isLiked ?? r.hasLiked),
            dislikesCount: Number.isFinite(parsedDislikeCount) ? parsedDislikeCount : 0,
            dislikedByCurrentUser: dislikedByCurrentUser || Boolean(r.isDislikedByCurrentUser ?? r.isDisliked ?? r.hasDisliked),
            comments: rawComments.map(mapCommentNode),
        };
    });

    const genreNames = extractGenreNames(data.genres ?? data.genre ?? data.genreIds, genreOptions);
    const role = typeof currentUser?.role === 'string' ? currentUser.role.toUpperCase() : '';
    const isAuthenticated = Boolean(currentUser);
    const canSaveToLibrary = role === 'USER' || role === 'PREMIUM_USER';

    const hasUserReviewed = Boolean(
        currentUserId &&
        (data.reviews ?? []).some((r: any) => r.userId === currentUserId || r.user?.id === currentUserId)
    );

    if (canSaveToLibrary) {
        watchlistPayload = await getMyWatchlists()
            .then((response) => response.data)
            .catch(() => null);
    }

    const watchlistItems = extractArray(watchlistPayload, ["watchlist", "items", "movies", "results", "data"]);
    const matchedWatchlistItem = watchlistItems.find((item) => {
        const movieId = findValue(item, ["movieId", "id", "_id"]);
        return typeof movieId === 'string' && movieId === String(data.id);
    });
    const initialSaved = Boolean(matchedWatchlistItem);
    const initialWatchlistId = (() => {
        const value = findValue(matchedWatchlistItem, ["watchlistId", "id", "_id"]);
        return typeof value === "string" ? value : null;
    })();

    const movie = {
        id: data.id as string,
        title: data.title as string,
        releaseDate: data.releaseYear ? `${data.releaseYear}-01-01` : new Date().toISOString(),
        posterPath: resolveMediaUrl(data.poster as string, 'https://images.unsplash.com/photo-1534809027769-b00d750a2883'),
        backdropPath: resolveMediaUrl(data.poster as string) || undefined,
        rating: avgRating,
        language: 'English',
        // duration: 'N/A',
        genre: genreNames,
        votes: approvedReviews.length,
        overview: (data.description as string) ?? '',
        ageGroup: (data.ageGroup as string) ?? undefined,
        priceType: (data.priceType as string) ?? undefined,
        director: data.director ? { name: data.director as string, role: 'Director' } : undefined,
        cast: castArray,
        reviews: mappedReviews,
    };

    return (
        <MovieDetailsClient
            movie={movie}
            isAuthenticated={isAuthenticated}
            canSaveToLibrary={canSaveToLibrary}
            initialSaved={initialSaved}
            initialWatchlistId={initialWatchlistId}
            hasUserReviewed={hasUserReviewed}
            currentUserId={currentUserId || null}
            loginHref={`/login?redirect=${encodeURIComponent(`/movie/${id}`)}`}
        />
    );
}

