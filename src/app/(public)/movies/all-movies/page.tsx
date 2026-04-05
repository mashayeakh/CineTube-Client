import { Film, Star } from "lucide-react";

import { resolveMediaUrl } from "@/lib/media";
import { getMoviesWithContributions } from "@/service/movie.services";

export const dynamic = "force-dynamic";

type UnknownRecord = Record<string, unknown>;

type CatalogItem = {
    id: string;
    title: string;
    description: string;
    poster: string;
    releaseYear?: number;
    director: string;
    priceType: string;
    status: string;
    genres: string[];
    platforms: string[];
    reviewCount: number;
    contributorName: string;
    itemType: "movie" | "contribution";
    createdAt?: string;
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

function pickNumber(source: unknown, keys: string[]) {
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

function normalizeCatalogItem(input: unknown, itemType: CatalogItem["itemType"]): CatalogItem | null {
    if (!isRecord(input)) {
        return null;
    }

    const id = pickString(input, ["id", "_id"]);
    const title = pickString(input, ["title", "name"]);

    if (!id || !title) {
        return null;
    }

    const userSource = input.user;
    const contributorSource = input.contributor;
    const ownerSource = isRecord(contributorSource) ? contributorSource : userSource;

    return {
        id,
        title,
        description: pickString(input, ["description"], "No description available."),
        poster: pickString(input, ["poster", "image"]),
        releaseYear: pickNumber(input, ["releaseYear", "year"]),
        director: pickString(input, ["director"], "Unknown director"),
        priceType: pickString(input, ["priceType"], itemType === "contribution" ? "CONTRIBUTED" : "STANDARD"),
        status: pickString(input, ["status"], ""),
        genres: extractArray(input, ["genres"]).map((item) => pickString(item, ["name", "title"])).filter(Boolean),
        platforms: extractArray(input, ["platforms"]).map((item) => pickString(item, ["name", "title"])).filter(Boolean),
        reviewCount: extractArray(input, ["reviews"]).length,
        contributorName: pickString(ownerSource, ["name", "fullName", "username"], itemType === "contribution" ? "Community contributor" : "CineTube"),
        itemType,
        createdAt: pickString(input, ["createdAt"]),
    };
}

function normalizeCatalog(raw: unknown) {
    const movies = extractArray(raw, ["movies", "data", "items"])
        .map((item) => normalizeCatalogItem(item, "movie"))
        .filter((item): item is CatalogItem => item !== null);

    const contributions = extractArray(raw, ["contributions"])
        .map((item) => normalizeCatalogItem(item, "contribution"))
        .filter((item): item is CatalogItem => item !== null);

    return { movies, contributions };
}

function mergeCatalogItems(movies: CatalogItem[], contributions: CatalogItem[]) {
    return [...movies, ...contributions]
        .filter((item) => item.status.toUpperCase() !== "PENDING")
        .sort((a, b) => {
            const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
            const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
            return bTime - aTime;
        });
}

function StatusBadge({ value }: { value: string }) {
    if (!value.trim()) {
        return null;
    }

    const normalized = value.toUpperCase();
    const tone = normalized.includes("APPROVED") || normalized.includes("LIVE")
        ? "bg-emerald-100 text-emerald-700"
        : normalized.includes("PENDING")
            ? "bg-amber-100 text-amber-700"
            : "bg-slate-100 text-slate-700";

    return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${tone}`}>{value}</span>;
}

function MovieCard({ item }: { item: CatalogItem }) {
    const posterUrl = resolveMediaUrl(item.poster);

    return (
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="aspect-4/5 bg-slate-100">
                {posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={posterUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">No poster available</div>
                )}
            </div>

            <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="line-clamp-2 text-xl font-semibold text-slate-950">{item.title}</h2>
                    </div>
                    <StatusBadge value={item.status} />
                </div>

                <p className="line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p>

                <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Year</p>
                        <p className="mt-1 font-medium text-slate-900">{item.releaseYear ?? "—"}</p>
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

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-600">
                    <span>By {item.contributorName}</span>
                    <span className="inline-flex items-center gap-1 font-medium text-slate-900">
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                        {item.reviewCount} reviews
                    </span>
                </div>
            </div>
        </article>
    );
}

export default async function AllMoviesPage() {
    let payload: unknown = {};

    try {
        const response = await getMoviesWithContributions();
        payload = response.data;
        // console.log("[all-movies] backend payload:", JSON.stringify(payload, null, 2)); 
    } catch (error) {
        console.error("[all-movies] failed to fetch /movies/all-with-contributions:", error);
    }

    const { movies, contributions } = normalizeCatalog(payload);
    const mergedItems = mergeCatalogItems(movies, contributions);
    const totalItems = mergedItems.length;
    const itemsWithPoster = mergedItems.filter((item) => Boolean(item.poster)).length;
    const itemsWithReviews = mergedItems.filter((item) => item.reviewCount > 0).length;

    console.log("[all-movies] normalized counts:", {
        movies: movies.length,
        contributions: contributions.length,
        totalItems,
    });

    return (
        <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_45%,#ffffff_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Movie Catalog</p>
                            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">All Catalog Items</h1>
                            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                                Browse everything in one merged feed.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                <p className="text-xs uppercase tracking-wide text-slate-400">Total items</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-950">{totalItems}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                <p className="text-xs uppercase tracking-wide text-slate-400">With poster</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-950">{itemsWithPoster}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                <p className="text-xs uppercase tracking-wide text-slate-400">With reviews</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-950">{itemsWithReviews}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-950 p-3 text-white">
                            <Film className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-950">All Items</h2>
                            <p className="text-sm text-slate-600">Merged feed from all sources.</p>
                        </div>
                    </div>

                    {mergedItems.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
                            No items found from the API.
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {mergedItems.map((item) => (
                                <MovieCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
