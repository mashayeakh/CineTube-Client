/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/media";
import { getSeriesById } from "@/app/(public)/public/_actions/series";
import { getUserInfo } from "@/service/auth.services";
import { extractArray, findValue } from "@/lib/user-dashboard.utils";
import { getMySeriesWatchlists } from "@/service/watchlist.services";
import SeriesDetailsClient, { type SeriesDetail } from "./SeriesDetailsClient";

// ─── helpers ────────────────────────────────────────────────────────────────

function str(value: unknown, fallback = ""): string {
    if (typeof value === "string") return value.trim() || fallback;
    if (typeof value === "number") return String(value);
    return fallback;
}

function num(value: unknown, fallback = 0): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function toArray(value: unknown): unknown[] {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return value ? [value] : [];
        }
    }
    return [];
}

function normalizeId(value: unknown): string {
    if (typeof value === "string") return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    return "";
}

function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#030919] text-white">
            <Tv className="size-16 text-slate-500" />
            <h1 className="text-2xl font-bold">Series Not Found</h1>
            <p className="text-slate-400">The series you are looking for does not exist.</p>
            <Link href="/series">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Browse Series
                </Button>
            </Link>
        </div>
    );
}

// ─── page ───────────────────────────────────────────────────────────────────

export default async function SeriesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    noStore();

    const { id } = await params;

    const [data, currentUser] = await Promise.all([
        getSeriesById(id),
        getUserInfo().catch(() => null),
    ]);

console.log("object")
    console.log("=========‼️‼️‼️‼️‼️ get series by id", getSeriesById)


    if (!data) return <NotFound />;

    // ── auth + permission (mirrors MovieDetails page exactly) ────────────────
    const role =
        typeof (currentUser as any)?.role === "string"
            ? (currentUser as any).role.toUpperCase()
            : "";
    const isAuthenticated = Boolean(currentUser);
    const canSaveToLibrary = role === "USER" || role === "PREMIUM_USER";

    const currentUserId = normalizeId(
        findValue(currentUser as Record<string, unknown> | null, ["id", "_id", "userId"])
    );

    // ── watchlist lookup — use SERIES endpoint, match by seriesId ────────────
    let watchlistPayload: unknown = null;
    if (canSaveToLibrary) {
        watchlistPayload = await getMySeriesWatchlists()
            .then((response) => response.data)
            .catch(() => null);
    }

    const watchlistItems = extractArray(watchlistPayload, [
        "watchlist",
        "items",
        "series",
        "results",
        "data",
    ]);

    const matchedWatchlistItem = watchlistItems.find((item: any) => {
        const topLevelId = normalizeId(
            findValue(item, ["seriesId", "id", "_id"])
        );
        const nestedId = normalizeId(item?.series?.id ?? item?.series?._id ?? "");
        const currentId = String(data.id);
        return topLevelId === currentId || nestedId === currentId;
    });

    const initialSaved = Boolean(matchedWatchlistItem);
    const initialWatchlistId = (() => {
        const value = findValue(matchedWatchlistItem, ["watchlistId", "id", "_id"]);
        return typeof value === "string" ? value : null;
    })();

    // ── hasUserReviewed (mirrors movie page) ─────────────────────────────────
    const allReviewsRaw: any[] = toArray(data.reviews ?? data.review) as any[];
    const hasUserReviewed = Boolean(
        currentUserId &&
        allReviewsRaw.some(
            (r: any) =>
                r.userId === currentUserId || r.user?.id === currentUserId
        )
    );

    // ── Normalise series fields ───────────────────────────────────────────────
    const poster = resolveMediaUrl(
        str(data.poster ?? data.image),
        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7"
    );
    const releaseYear = num(data.releaseYear ?? data.year);
    const language = str(data.language, "English");
    const seasonCount = num(data.seasonCount ?? data.seasons);
    const status = str(data.status, "UNKNOWN");

    const genres = toArray(data.genres ?? data.genre)
        .map((g: any) =>
            typeof g === "string" ? g : str(g?.name ?? g?.id)
        )
        .filter(Boolean) as string[];

    const cast = toArray(data.cast)
        .map((c: any) => ({
            name: typeof c === "string" ? c : str(c?.name ?? c),
            character:
                typeof c === "object" && c !== null
                    ? str(c.character ?? c.role)
                    : "",
            avatar:
                typeof c === "object" && c !== null
                    ? str(c.avatar ?? c.image)
                    : undefined,
        }))
        .filter((c) => Boolean(c.name));

    const platforms = toArray(data.platforms ?? data.platform)
        .map((p: any) =>
            typeof p === "string" ? p : str(p?.name ?? p?.id ?? p)
        )
        .filter(Boolean) as string[];

    const approvedReviews = allReviewsRaw.filter(
        (r: any) => str(r?.status).toUpperCase() === "APPROVED"
    );
    const avgRating =
        approvedReviews.length > 0
            ? Number(
                (
                    approvedReviews.reduce(
                        (s: number, r: any) => s + num(r?.rating),
                        0
                    ) / approvedReviews.length
                ).toFixed(1)
            )
            : 0;

    const mappedReviews: SeriesDetail["reviews"] = allReviewsRaw
        .filter((r: any) => str(r?.status).toUpperCase() === "APPROVED")
        .map((r: any, i: number) => {
            const tags = toArray(r?.tags)
                .map((t: any) => str(t))
                .filter(Boolean) as string[];

            const comments = toArray(r?.comments ?? r?.comment).map(
                (c: any) => ({
                    id: str(c?.id, `c-${i}-${Math.random()}`),
                    userId: str(c?.userId ?? c?.user?.id),
                    userName: str(c?.user?.name),
                    parentId: str(c?.parentId) || null,
                    content: str(c?.content ?? c?.body),
                    isSpoiler: Boolean(c?.isSpoiler),
                    createdAt: str(c?.createdAt, new Date().toISOString()),
                    replies: [] as SeriesDetail["reviews"][number]["comments"],
                })
            );

            return {
                id: str(r?.id, `review-${i}`),
                userId: str(r?.userId, "unknown"),
                userName: str(r?.user?.name),
                rating: num(r?.rating),
                content: str(r?.content ?? r?.body),
                isSpoiler: Boolean(r?.isSpoiler),
                tags,
                status: str(r?.status, "APPROVED"),
                createdAt: str(r?.createdAt, new Date().toISOString()),
                likesCount: num(r?.likesCount ?? r?.likeCount),
                likedByCurrentUser: Boolean(
                    currentUserId &&
                    toArray(
                        r?.likes ?? r?.likedBy ?? r?.reviewLikes
                    ).some((entry: any) => {
                        if (typeof entry === "string")
                            return entry === currentUserId;
                        if (entry && typeof entry === "object") {
                            return (
                                normalizeId(entry.userId) ===
                                currentUserId ||
                                normalizeId(entry.id) === currentUserId
                            );
                        }
                        return false;
                    })
                ),
                comments,
            };
        });

    const series: SeriesDetail = {
        id: str(data.id),
        title: str(data.title ?? data.name, "Untitled Series"),
        releaseYear,
        posterPath: poster,
        backdropPath: poster,
        rating: avgRating,
        content: str(data.contentRating ?? data.rating, "NR"),
        language,
        genre: genres,
        votes: approvedReviews.length,
        overview: str(data.description ?? data.overview),
        ageGroup: str(data.ageGroup),
        priceType: str(data.priceType),
        status,
        seasonCount,
        director: str(data.director),
        cast,
        platforms,
        reviews: mappedReviews,
    };

    return (
        <SeriesDetailsClient
            series={series}
            isAuthenticated={isAuthenticated}
            canSaveToLibrary={canSaveToLibrary}
            initialSaved={initialSaved}
            initialWatchlistId={initialWatchlistId}
            hasUserReviewed={hasUserReviewed}
            currentUserId={currentUserId || null}
            loginHref={`/login?redirect=${encodeURIComponent(`/series/${id}`)}`}
        />
    );
}