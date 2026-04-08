/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import {
    ArrowLeft,
    Calendar,
    Clapperboard,
    Globe,
    Layers,
    Star,
    Tv,
    Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/media";
import { getSeriesById } from "@/app/(public)/public/_actions/series";

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

function statusLabel(status: string) {
    const map: Record<string, { label: string; color: string }> = {
        ONGOING: { label: "Ongoing", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
        COMPLETED: { label: "Completed", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
        UPCOMING: { label: "Upcoming", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    };
    return map[status?.toUpperCase()] ?? { label: status || "Unknown", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" };
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
    const data = await getSeriesById(id);

    if (!data) return <NotFound />;

    const title = str(data.title ?? data.name, "Untitled Series");
    const description = str(data.description ?? data.overview);
    const poster = resolveMediaUrl(str(data.poster ?? data.image), "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7");
    const releaseYear = num(data.releaseYear ?? data.year);
    const language = str(data.language, "English");
    const director = str(data.director);
    const seasonCount = num(data.seasonCount ?? data.seasons);
    const status = str(data.status, "UNKNOWN");
    const ageGroup = str(data.ageGroup);
    const priceType = str(data.priceType);

    const genres = toArray(data.genres ?? data.genre).map((g: any) =>
        typeof g === "string" ? g : str(g?.name ?? g?.id)
    ).filter(Boolean);

    const cast = toArray(data.cast).map((c: any) =>
        typeof c === "string" ? c : str(c?.name ?? c)
    ).filter(Boolean);

    const platforms = toArray(data.platforms ?? data.platform).map((p: any) =>
        typeof p === "string" ? p : str(p?.name ?? p?.id ?? p)
    ).filter(Boolean);

    const allReviews: any[] = toArray(data.reviews ?? data.review) as any[];
    const approvedReviews = allReviews.filter((r: any) => str(r?.status).toUpperCase() === "APPROVED");
    const avgRating =
        approvedReviews.length > 0
            ? Number(
                (approvedReviews.reduce((s: number, r: any) => s + num(r?.rating), 0) / approvedReviews.length).toFixed(1)
            )
            : 0;

    const { label: statusText, color: statusColor } = statusLabel(status);

    return (
        <div className="min-h-screen bg-linear-to-b from-[#030919] via-[#041335] to-[#020617] text-white">
            {/* Back nav */}
            <div className="mx-auto max-w-5xl px-4 pt-6 md:px-8">
                <Link href="/series" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
                    <ArrowLeft className="size-4" />
                    Back to Series
                </Link>
            </div>

            {/* Hero */}
            <section className="mx-auto mt-6 max-w-5xl px-4 md:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    {/* Poster */}
                    <div className="relative h-80 w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-2xl md:h-96 md:w-60">
                        <Image
                            src={poster}
                            alt={title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Info */}
                    <div className="flex min-w-0 flex-col justify-center gap-4">
                        {/* Status badge */}
                        <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusColor}`}>
                            {statusText}
                        </span>

                        <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h1>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                            {releaseYear > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="size-4" />
                                    {releaseYear}
                                </span>
                            )}
                            {language && (
                                <span className="flex items-center gap-1.5">
                                    <Globe className="size-4" />
                                    {language}
                                </span>
                            )}
                            {seasonCount > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <Layers className="size-4" />
                                    {seasonCount} Season{seasonCount !== 1 ? "s" : ""}
                                </span>
                            )}
                            {avgRating > 0 && (
                                <span className="flex items-center gap-1.5 text-amber-400">
                                    <Star className="size-4 fill-amber-400" />
                                    {avgRating} / 10
                                </span>
                            )}
                            {ageGroup && (
                                <span className="rounded border border-white/20 px-2 py-0.5 text-xs font-semibold text-slate-300">
                                    {ageGroup}
                                </span>
                            )}
                            {priceType && priceType !== "FREE" && (
                                <Badge variant="outline" className="border-violet-500/40 bg-violet-500/10 text-violet-400">
                                    {priceType}
                                </Badge>
                            )}
                        </div>

                        {/* Description */}
                        {description && (
                            <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                                {description}
                            </p>
                        )}

                        {/* Genres */}
                        {genres.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {genres.map((g, index) => (
                                    <span
                                        key={`${g}-${index}`}
                                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                                    >
                                        {g}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Director & Cast */}
                        <div className="flex flex-wrap gap-6 text-sm text-slate-400">
                            {director && (
                                <div className="flex items-center gap-2">
                                    <Clapperboard className="size-4 shrink-0" />
                                    <span>Director: <span className="font-medium text-white">{director}</span></span>
                                </div>
                            )}
                            {platforms.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Tv className="size-4 shrink-0" />
                                    <span>Platform: <span className="font-medium text-white">{platforms.join(", ")}</span></span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Cast */}
            {cast.length > 0 && (
                <section className="mx-auto mt-10 max-w-5xl px-4 md:px-8">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                        <Users className="size-5 text-slate-400" />
                        Cast
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {cast.map((name, index) => (
                            <span
                                key={`${name}-${index}`}
                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300"
                            >
                                {name}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Reviews */}
            <section className="mx-auto mt-10 max-w-5xl px-4 pb-16 md:px-8">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Star className="size-5 text-amber-400" />
                    Reviews
                    <span className="ml-1 text-sm font-normal text-slate-400">({approvedReviews.length})</span>
                </h2>

                {approvedReviews.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
                        No approved reviews yet. Be the first to review this series.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {approvedReviews.map((review: any, i: number) => {
                            const rating = num(review?.rating);
                            const content = str(review?.content ?? review?.body);
                            const createdAt = str(review?.createdAt);
                            const tags: string[] = toArray(review?.tags).map((t: any) => str(t)).filter(Boolean);
                            const isSpoiler = Boolean(review?.isSpoiler);

                            return (
                                <div
                                    key={str(review?.id, `review-${i}`)}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                                >
                                    <div className="mb-2 flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm font-bold">
                                            {str(review?.userId, "U").slice(-2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white">
                                                User {str(review?.userId, "Unknown").slice(0, 8)}
                                            </p>
                                            {createdAt && (
                                                <p className="text-xs text-slate-500">
                                                    {new Date(createdAt).toLocaleDateString("en-US", {
                                                        year: "numeric", month: "short", day: "numeric",
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                        {rating > 0 && (
                                            <span className="flex items-center gap-1 text-sm font-semibold text-amber-400">
                                                <Star className="size-3.5 fill-amber-400" />
                                                {rating}/10
                                            </span>
                                        )}
                                    </div>

                                    {isSpoiler && (
                                        <p className="mb-2 text-xs font-medium text-amber-500">⚠ Contains spoilers</p>
                                    )}

                                    {content && (
                                        <p className="text-sm leading-relaxed text-slate-300">{content}</p>
                                    )}

                                    {tags.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {tags.map((tag, tagIndex) => (
                                                <span
                                                    key={`${tag}-${tagIndex}`}
                                                    className="rounded-full bg-slate-700/60 px-2 py-0.5 text-xs text-slate-400"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
