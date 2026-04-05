import { Star } from "lucide-react";

import { resolveMediaUrl } from "@/lib/media";
import { getTopRatedMovies } from "@/service/movie.services";

export const dynamic = "force-dynamic";

type UnknownRecord = Record<string, unknown>;

type TopRatedItem = {
    id: string;
    title: string;
    description: string;
    poster: string;
    releaseYear?: number;
    director: string;
    priceType: string;
    genres: string[];
    platforms: string[];
    averageRating: number;
    reviewCount: number;
};

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickString(source: unknown, keys: string[], fallback = "") {
    if (!isRecord(source)) {
        return fallback;
    }

    for (const key of keys) {
        const value = source[key];

        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    return fallback;
}

function pickNumber(source: unknown, keys: string[], fallback = 0) {
    if (!isRecord(source)) {
        return fallback;
    }

    for (const key of keys) {
        const value = source[key];

        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }
    }

    return fallback;
}

function pickOptionalNumber(source: unknown, keys: string[]) {
    if (!isRecord(source)) {
        return undefined;
    }

    for (const key of keys) {
        const value = source[key];

        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }
    }

    return undefined;
}

function extractArray(source: unknown, keys: string[]) {
    if (Array.isArray(source)) {
        return source;
    }

    if (!isRecord(source)) {
        return [];
    }

    for (const key of keys) {
        const value = source[key];

        if (Array.isArray(value)) {
            return value;
        }
    }

    return [];
}

function normalizeTopRatedItem(input: unknown): TopRatedItem | null {
    if (!isRecord(input)) {
        return null;
    }

    const id = pickString(input, ["id", "_id"]);
    const title = pickString(input, ["title", "name"]);

    if (!id || !title) {
        return null;
    }

    const metricsSource = isRecord(input.metrics) ? input.metrics : {};

    return {
        id,
        title,
        description: pickString(input, ["description"], "No description available."),
        poster: pickString(input, ["poster", "image"]),
        releaseYear: pickOptionalNumber(input, ["releaseYear", "year"]),
        director: pickString(input, ["director"], "Unknown director"),
        priceType: pickString(input, ["priceType"], "FREE"),
        genres: extractArray(input, ["genres"]).map((item) => pickString(item, ["name", "title"]).trim()).filter(Boolean),
        platforms: extractArray(input, ["platforms"]).map((item) => pickString(item, ["name", "title"]).trim()).filter(Boolean),
        averageRating: pickNumber(metricsSource, ["averageRating"], 0),
        reviewCount: pickNumber(metricsSource, ["reviewCount"], extractArray(input, ["reviews"]).length),
    };
}

function normalizeTopRatedList(raw: unknown) {
    return extractArray(raw, ["result", "data", "items"])
        .map(normalizeTopRatedItem)
        .filter((item): item is TopRatedItem => item !== null);
}

function TopRatedCard({ item }: { item: TopRatedItem }) {
    const posterUrl = resolveMediaUrl(item.poster);

    return (
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="aspect-4/5 bg-slate-100">
                {posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={posterUrl} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">No poster available</div>
                )}
            </div>

            <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                    <h2 className="line-clamp-2 text-xl font-semibold text-slate-950">{item.title}</h2>
                    <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        <Star className="size-3.5 fill-amber-400 text-amber-500" />
                        {item.averageRating.toFixed(1)}
                    </div>
                </div>

                <p className="line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p>

                <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Year</p>
                        <p className="mt-1 font-medium text-slate-900">{item.releaseYear ?? "-"}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Access</p>
                        <p className="mt-1 font-medium text-slate-900">{item.priceType}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Director</p>
                        <p className="mt-1 line-clamp-1 font-medium text-slate-900">{item.director}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {item.genres.slice(0, 3).map((genre) => (
                        <span key={`${item.id}-${genre}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {genre}
                        </span>
                    ))}
                    {item.platforms.slice(0, 2).map((platform) => (
                        <span key={`${item.id}-${platform}`} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                            {platform}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-end border-t border-slate-100 pt-4 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-900">
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                        {item.reviewCount} reviews
                    </span>
                </div>
            </div>
        </article>
    );
}

export default async function TopRatedMoviesPage() {
    let payload: unknown = [];

    try {
        const response = await getTopRatedMovies();
        payload = response.data;
        console.log("[top-rated] backend payload:", JSON.stringify(payload, null, 2));
    } catch (error) {
        console.error("[top-rated] failed to fetch /movies/top-rated:", error);
    }

    const topRatedMovies = normalizeTopRatedList(payload);

    return (
        <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_45%,#ffffff_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Movies</p>
                            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Top Rated Movies</h1>
                            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                                Highest-rated movies ranked by audience and review activity.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Total top-rated</p>
                            <p className="mt-2 text-3xl font-semibold text-slate-950">{topRatedMovies.length}</p>
                        </div>
                    </div>
                </section>

                {topRatedMovies.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
                        No top-rated movies found from the API.
                    </div>
                ) : (
                    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {topRatedMovies.map((item) => (
                            <TopRatedCard key={item.id} item={item} />
                        ))}
                    </section>
                )}
            </div>
        </main>
    );
}