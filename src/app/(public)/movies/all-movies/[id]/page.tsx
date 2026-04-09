/* eslint-disable @typescript-eslint/no-explicit-any */
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { resolveMediaUrl } from "@/lib/media";
import { getUserInfo } from "@/service/auth.services";
import { getMyWatchlists } from "@/service/watchlist.services";
import { extractArray, findValue } from "@/lib/user-dashboard.utils";
import MovieDetailsClient from "@/app/(public)/public/[id]/MovieDetailsClient";

function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Film className="size-16 mx-auto mb-4 text-muted-foreground" />
                <h1 className="text-2xl font-bold mb-2">Movie Not Found</h1>
                <p className="text-muted-foreground mb-4">
                    The movie you are looking for does not exist.
                </p>
                <Button>
                    <Link href="/movies/all-movies">Browse Movies</Link>
                </Button>
            </div>
        </div>
    );
}

function normalizeId(value: unknown): string {
    if (typeof value === "string") return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    return "";
}

function extractGenreNames(rawGenres: unknown): string[] {
    if (!rawGenres) return [];
    const names = new Set<string>();
    const add = (v: unknown) => {
        if (typeof v === "string" && v.trim()) names.add(v.trim());
        else if (v && typeof v === "object") {
            const r = v as Record<string, unknown>;
            if (typeof r.name === "string" && r.name.trim()) names.add(r.name.trim());
        }
    };
    if (Array.isArray(rawGenres)) rawGenres.forEach(add);
    else add(rawGenres);
    return Array.from(names);
}

function parseCast(raw: unknown): { name: string; character: string; avatar?: string }[] {
    if (!raw) return [];
    let arr: unknown[] = [];
    if (Array.isArray(raw)) arr = raw;
    else if (typeof raw === "string") {
        try { arr = JSON.parse(raw); } catch { return []; }
    }
    return arr.map((item) => {
        if (typeof item === "string") return { name: item, character: "" };
        if (item && typeof item === "object") {
            const r = item as Record<string, unknown>;
            return {
                name: typeof r.name === "string" ? r.name : "",
                character: typeof r.character === "string" ? r.character : typeof r.role === "string" ? r.role : "",
                avatar: typeof r.avatar === "string" ? r.avatar : typeof r.image === "string" ? r.image : undefined,
            };
        }
        return { name: String(item), character: "" };
    }).filter((c) => c.name);
}

function parseReviews(rawReviews: any[], currentUserId: string) {
    return rawReviews
        .filter((r) => r.status === "APPROVED")
        .map((r) => {
            let tags: string[] = [];
            try {
                const parsed = JSON.parse(r.tags ?? "[]");
                if (Array.isArray(parsed)) tags = parsed.map(String);
            } catch {
                if (Array.isArray(r.tags)) tags = r.tags.map(String);
            }

            const likesArr: unknown[] = Array.isArray(r.likes ?? r.likedBy ?? r.reviewLikes)
                ? (r.likes ?? r.likedBy ?? r.reviewLikes) : [];

            const likedByCurrentUser = Boolean(
                currentUserId && likesArr.some((entry: any) => {
                    if (typeof entry === "string") return entry === currentUserId;
                    if (!entry || typeof entry !== "object") return false;
                    return normalizeId(entry.userId) === currentUserId || normalizeId(entry.id) === currentUserId;
                })
            );

            const mapComment = (c: any): any => ({
                id: String(c?.id ?? ""),
                userId: String(c?.userId ?? c?.user?.id ?? ""),
                content: typeof c?.content === "string" ? c.content : "",
                isSpoiler: Boolean(c?.isSpoiler),
                createdAt: typeof c?.createdAt === "string" ? c.createdAt : "",
                parentId: typeof c?.parentId === "string" ? c.parentId : null,
                replies: Array.isArray(c?.replies) ? c.replies.map(mapComment) : [],
            });

            return {
                id: r.id as string,
                userId: r.userId as string,
                rating: Number(r.rating ?? 0),
                content: (r.content as string) ?? "",
                isSpoiler: Boolean(r.isSpoiler),
                tags,
                status: (r.status as string) ?? "",
                createdAt: (r.createdAt as string) ?? "",
                likesCount: Math.max(
                    typeof r.likesCount === "number" ? r.likesCount : 0,
                    likesArr.length
                ),
                likedByCurrentUser,
                comments: Array.isArray(r.comments) ? r.comments.map(mapComment) : [],
            };
        });
}

type PageProps = { params: Promise<{ id: string }> };

export default async function AllMoviesDetailsPage({ params }: PageProps) {
    noStore();

    const { id } = await params;

    // ── FETCH ─────────────────────────────────────────────────────────────────
    let data: any = null;
    let rawJson: any = null;

    try {
        const apiBase =
            process.env.NEXT_PUBLIC_API_URL ??
            process.env.API_URL ??
            "http://localhost:5000";

        const url = `${apiBase}/movies/all-movies/${id}`;
        console.log("[movie-detail] fetching:", url);

        const res = await fetch(url, { cache: "no-store" });
        console.log("[movie-detail] status:", res.status);

        rawJson = await res.json().catch(() => null);
        console.log("[movie-detail] raw response keys:", rawJson ? Object.keys(rawJson) : "null");
        console.log("[movie-detail] raw response:", JSON.stringify(rawJson, null, 2).slice(0, 1000));

        if (res.ok && rawJson) {
            // Try every common shape
            data =
                rawJson?.result?.data?.[0] ??   // { result: { data: [movie] } }
                rawJson?.result?.data ??          // { result: { data: movie } }
                rawJson?.result ??                // { result: movie }
                rawJson?.data?.[0] ??             // { data: [movie] }
                rawJson?.data ??                  // { data: movie }
                rawJson;                          // movie directly

            // If data is still an array, take first element
            if (Array.isArray(data)) data = data[0];

            console.log("[movie-detail] resolved data id:", data?.id ?? "NONE");
        }
    } catch (err) {
        console.error("[movie-detail] fetch error:", err);
    }

    if (!data || !data.id) {
        console.error("[movie-detail] no valid data found. rawJson was:", JSON.stringify(rawJson).slice(0, 500));
        return <NotFound />;
    }

    // ── AUTH ──────────────────────────────────────────────────────────────────
    let currentUser: Record<string, unknown> | null = null;
    let watchlistPayload: unknown = null;

    try {
        currentUser = (await getUserInfo().catch(() => null)) as Record<string, unknown> | null;
    } catch { /* unauthenticated */ }

    const currentUserId = normalizeId(findValue(currentUser, ["id", "_id", "userId"]));
    const role = typeof currentUser?.role === "string" ? currentUser.role.toUpperCase() : "";
    const isAuthenticated = Boolean(currentUser);
    const canSaveToLibrary = role === "USER" || role === "PREMIUM_USER";

    if (canSaveToLibrary) {
        watchlistPayload = await getMyWatchlists().then((r) => r.data).catch(() => null);
    }

    const watchlistItems = extractArray(watchlistPayload, ["watchlist", "items", "movies", "results", "data"]);
    const matchedWatchlistItem = watchlistItems.find((item) => {
        const movieId = findValue(item, ["movieId", "id", "_id"]);
        return typeof movieId === "string" && movieId === String(data.id);
    });
    const initialSaved = Boolean(matchedWatchlistItem);
    const initialWatchlistId = (() => {
        const v = findValue(matchedWatchlistItem, ["watchlistId", "id", "_id"]);
        return typeof v === "string" ? v : null;
    })();

    // ── REVIEWS ───────────────────────────────────────────────────────────────
    const rawReviews: any[] = Array.isArray(data.reviews) ? data.reviews : [];
    const mappedReviews = parseReviews(rawReviews, currentUserId);

    const avgRating = mappedReviews.length > 0
        ? Number((mappedReviews.reduce((sum, r) => sum + r.rating, 0) / mappedReviews.length).toFixed(1))
        : 0;

    const hasUserReviewed = Boolean(
        currentUserId && rawReviews.some((r) => r.userId === currentUserId || r.user?.id === currentUserId)
    );

    // ── MOVIE OBJECT ──────────────────────────────────────────────────────────
    const movie = {
        id: data.id as string,
        title: (data.title ?? data.name ?? "Untitled") as string,
        releaseDate: data.releaseYear
            ? `${data.releaseYear}-01-01`
            : (data.releaseDate ?? new Date().toISOString()),
        posterPath: resolveMediaUrl(
            data.poster ?? data.posterPath ?? data.image,
            "https://images.unsplash.com/photo-1534809027769-b00d750a2883"
        ),
        backdropPath:
            resolveMediaUrl(data.backdrop ?? data.backdropPath) ||
            resolveMediaUrl(data.poster ?? data.posterPath) ||
            undefined,
        rating: avgRating,
        language: (data.language ?? "English") as string,
        genre: extractGenreNames(data.genres ?? data.genre),
        votes: mappedReviews.length,
        overview: (data.description ?? data.overview ?? "") as string,
        ageGroup: (data.ageGroup ?? undefined) as string | undefined,
        priceType: (data.priceType ?? undefined) as string | undefined,
        director: data.director
            ? {
                name: typeof data.director === "string" ? data.director : (data.director as any)?.name ?? "Unknown",
                role: "Director",
            }
            : undefined,
        writers: Array.isArray(data.writers)
            ? data.writers.map((w: any) => ({
                name: typeof w === "string" ? w : (w?.name ?? "Unknown"),
                role: typeof w === "object" ? (w?.role ?? "Writer") : "Writer",
            }))
            : [],
        cast: parseCast(data.cast),
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
            loginHref={`/login?redirect=${encodeURIComponent(`/movies/all-movies/${id}`)}`}
        />
    );
}