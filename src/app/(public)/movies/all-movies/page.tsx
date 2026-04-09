// app/movies/all-movies/page.tsx
import { Film } from "lucide-react";
import { getMoviesWithContributions } from "@/service/movie.services";
import { MovieCatalogClient } from "./MovieCatalogClient";

export const dynamic = "force-dynamic";

type UnknownRecord = Record<string, unknown>;

export type CatalogItem = {
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
    if (!isRecord(source)) return fallback;
    for (const key of keys) {
        const value = source[key];
        if (typeof value === "string" && value.trim()) return value.trim();
    }
    return fallback;
}

function pickNumber(source: unknown, keys: string[]) {
    if (!isRecord(source)) return undefined;
    for (const key of keys) {
        const value = source[key];
        if (typeof value === "number" && Number.isFinite(value)) return value;
    }
    return undefined;
}

function extractArray(source: unknown, keys: string[]) {
    if (Array.isArray(source)) return source;
    if (!isRecord(source)) return [];
    for (const key of keys) {
        const value = source[key];
        if (Array.isArray(value)) return value;
    }
    return [];
}

function normalizeCatalogItem(input: unknown, itemType: CatalogItem["itemType"]): CatalogItem | null {
    if (!isRecord(input)) return null;
    const id = pickString(input, ["id", "_id"]);
    const title = pickString(input, ["title", "name"]);
    if (!id || !title) return null;
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

export default async function AllMoviesPage() {
    let payload: unknown = {};
    try {
        const response = await getMoviesWithContributions();
        payload = response.data;
    } catch (error) {
        console.error("[all-movies] failed to fetch:", error);
    }

    const { movies, contributions } = normalizeCatalog(payload);
    const mergedItems = mergeCatalogItems(movies, contributions);

    return (
        <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_45%,#ffffff_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Movie Catalog</p>
                            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">All Catalog Items</h1>
                            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">Browse everything in one merged feed.</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                <p className="text-xs uppercase tracking-wide text-slate-400">Total items</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-950">{mergedItems.length}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                <p className="text-xs uppercase tracking-wide text-slate-400">With poster</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-950">{mergedItems.filter((i) => Boolean(i.poster)).length}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                <p className="text-xs uppercase tracking-wide text-slate-400">With reviews</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-950">{mergedItems.filter((i) => i.reviewCount > 0).length}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Client-side filtered grid */}
                <MovieCatalogClient items={mergedItems} />
            </div>
        </main>
    );
}