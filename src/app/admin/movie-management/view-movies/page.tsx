import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Bell, Home, Search } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { MovieViewClient } from "@/components/admin/movie-view-client";
import { getAdminGenres, getAdminStreamingPlatforms } from "@/service/admin-content.services";
import { deleteAdminMovie, deleteAllAdminMovies, getAdminMovies, updateAdminMovie } from "@/service/admin-movie.services";

type UnknownRecord = Record<string, unknown>;

type OptionItem = {
    id: string;
    name: string;
};

type MovieRow = {
    id: string;
    title: string;
    releaseYear: number;
    priceType: string;
    ageGroup: string;
    director: string;
    genres: string[];
    platforms: string[];
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

function extractArray(source: unknown, keys: string[]) {
    if (Array.isArray(source)) {
        return source;
    }

    if (isRecord(source)) {
        for (const key of keys) {
            if (Array.isArray(source[key])) {
                return source[key] as unknown[];
            }
        }

        for (const value of Object.values(source)) {
            if (Array.isArray(value)) {
                return value;
            }
        }
    }

    return [] as unknown[];
}

function normalizeOptions(raw: unknown, typePrefix: string): OptionItem[] {
    const list = Array.isArray(raw) ? raw : [];

    return list
        .map((item, index) => ({
            id: pickString(item, ["id", "_id", `${typePrefix}Id`], `${typePrefix}-${index + 1}`),
            name: pickString(item, ["name", "title"], `${typePrefix} ${index + 1}`),
        }))
        .filter((item) => Boolean(item.id && item.name));
}

function normalizeMovies(raw: unknown): MovieRow[] {
    const list = extractArray(raw, ["movies", "result", "data", "items"]);

    return list.map((item, index) => {
        const releaseYearRaw = pickString(item, ["releaseYear"], "0");
        const releaseYear = Number(releaseYearRaw) || 0;
        const genres = extractArray(isRecord(item) ? item.genres : [], ["genres"]).map((genre) => pickString(genre, ["name", "title", "id", "_id"], "")).filter(Boolean);
        const platforms = extractArray(isRecord(item) ? item.platforms : [], ["platforms"]).map((platform) => pickString(platform, ["name", "title", "id", "_id"], "")).filter(Boolean);

        return {
            id: pickString(item, ["id", "_id", "movieId"], `movie-${index + 1}`),
            title: pickString(item, ["title"], "Untitled"),
            releaseYear,
            priceType: pickString(item, ["priceType"], "PREMIUM"),
            ageGroup: pickString(item, ["ageGroup"], "AGE_13_PLUS"),
            director: pickString(item, ["director"], "Unknown"),
            genres,
            platforms,
        };
    });
}

async function updateMovieAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const releaseYear = Number(formData.get("releaseYear") ?? 0);
    const priceType = String(formData.get("priceType") ?? "PREMIUM");
    const ageGroup = String(formData.get("ageGroup") ?? "AGE_13_PLUS");

    if (!id || !title) {
        return;
    }

    try {
        await updateAdminMovie(id, {
            title,
            releaseYear,
            priceType,
            ageGroup,
        });
    } catch (error) {
        console.error("Failed to update movie:", error);
    }

    revalidatePath("/admin/movie-management/view-movies");
}

async function deleteMovieAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");

    if (!id) {
        return;
    }

    try {
        await deleteAdminMovie(id);
    } catch (error) {
        console.error("Failed to delete movie:", error);
    }

    revalidatePath("/admin/movie-management/view-movies");
}

async function deleteAllMoviesAction() {
    "use server";

    try {
        await deleteAllAdminMovies();
    } catch (error) {
        console.error("Failed to delete all movies:", error);
    }

    revalidatePath("/admin/movie-management/view-movies");
}

export default async function AdminViewMoviesPage() {
    const [moviesResponse, rawGenres, rawPlatforms] = await Promise.all([
        getAdminMovies().catch(() => ({ data: [] })),
        getAdminGenres().catch(() => []),
        getAdminStreamingPlatforms().catch(() => []),
    ]);

    const genres = normalizeOptions(rawGenres, "genre");
    const platforms = normalizeOptions(rawPlatforms, "platform");
    const allMovies = normalizeMovies(moviesResponse.data);

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/movie-management/view-movies" />

                <div className="min-w-0">
                    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Movie Management</p>
                            <p className="text-xs text-slate-500">View movies with filters</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500 md:flex">
                                <Search className="size-4" />
                                Search
                            </div>
                            <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-700" type="button">
                                <Bell className="size-4" />
                            </button>
                            <Link href="/admin/dashboard" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-700">
                                <Home className="size-4" />
                            </Link>
                        </div>
                    </header>

                    <main className="p-4 sm:p-6">
                        <div className="mx-auto max-w-7xl space-y-5">
                            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-sm text-slate-500">Admin / Movie Management / View Movies</p>
                                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">View Movies With Filters</h1>
                                <p className="mt-2 text-sm text-slate-600">Filter, edit, and delete movie records from one place.</p>
                            </section>

                            <MovieViewClient
                                movies={allMovies}
                                genres={genres}
                                platforms={platforms}
                                updateMovieAction={updateMovieAction}
                                deleteMovieAction={deleteMovieAction}
                                deleteAllMoviesAction={deleteAllMoviesAction}
                            />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
