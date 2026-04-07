import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Home, Search } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { MovieViewClient } from "@/components/admin/movie-view-client";
import { getUserInfo } from "@/service/auth.services";
import { getAdminGenres, getAdminStreamingPlatforms } from "@/service/admin-content.services";
import { createAdminMovie, deleteAdminMovie, deleteAllAdminMovies, getAdminMovies, updateAdminMovie } from "@/service/admin-movie.services";

type UnknownRecord = Record<string, unknown>;

type OptionItem = {
    id: string;
    name: string;
};

type MovieRow = {
    id: string;
    title: string;
    description: string;
    releaseYear: number;
    priceType: string;
    ageGroup: string;
    director: string;
    poster: string;
    cast: string[];
    genres: string[];
    platforms: string[];
};

type PageSearchParams = {
    create?: string;
    error?: string;
    success?: string;
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
    const list = Array.isArray(raw)
        ? raw
        : isRecord(raw) && Array.isArray(raw.result)
            ? (raw.result as unknown[])
            : isRecord(raw) && Array.isArray(raw.data)
                ? (raw.data as unknown[])
                : isRecord(raw) && Array.isArray(raw.items)
                    ? (raw.items as unknown[])
                    : [];

    return list
        .map((item, index) => ({
            id: pickString(item, ["id", "_id", `${typePrefix}Id`], `${typePrefix}-${index + 1}`),
            name: pickString(item, ["name", "title"], `${typePrefix} ${index + 1}`),
        }))
        .filter((item) => Boolean(item.id && item.name));
}

function extractStringArray(source: unknown): string[] {
    if (!Array.isArray(source)) {
        return [];
    }

    return source
        .map((item) => {
            if (typeof item === "string") {
                return item.trim();
            }

            return pickString(item, ["name", "title", "fullName", "value"], "");
        })
        .filter(Boolean);
}

function normalizeMovies(raw: unknown): MovieRow[] {
    const list = extractArray(raw, ["movies", "result", "data", "items"]);

    return list.map((item, index) => {
        const releaseYearRaw = pickString(item, ["releaseYear"], "0");
        const releaseYear = Number(releaseYearRaw) || 0;
        const genres = extractArray(isRecord(item) ? item.genres : [], ["genres"]).map((genre) => pickString(genre, ["name", "title", "id", "_id"], "")).filter(Boolean);
        const platforms = extractArray(isRecord(item) ? item.platforms : [], ["platforms"]).map((platform) => pickString(platform, ["name", "title", "id", "_id"], "")).filter(Boolean);
        const cast = extractStringArray(isRecord(item) ? item.cast : []);

        return {
            id: pickString(item, ["id", "_id", "movieId"], `movie-${index + 1}`),
            title: pickString(item, ["title"], "Untitled"),
            description: pickString(item, ["description", "summary", "overview"], ""),
            releaseYear,
            priceType: pickString(item, ["priceType"], "PREMIUM"),
            ageGroup: pickString(item, ["ageGroup"], "AGE_13_PLUS"),
            director: pickString(item, ["director"], "Unknown"),
            poster: pickString(item, ["poster", "thumbnail", "image"], ""),
            cast,
            genres,
            platforms,
        };
    });
}

function buildActionRedirectPath(params: { create?: boolean; error?: string; success?: string }) {
    const query = new URLSearchParams();

    if (params.create) {
        query.set("create", "1");
    }

    if (params.error) {
        query.set("error", params.error);
    }

    if (params.success) {
        query.set("success", params.success);
    }

    const queryString = query.toString();
    return queryString
        ? `/admin/movie-management/view-movies?${queryString}`
        : "/admin/movie-management/view-movies";
}

function extractActionErrorMessage(error: unknown) {
    if (isRecord(error)) {
        const response = error.response;

        if (isRecord(response)) {
            const data = response.data;

            if (isRecord(data)) {
                const nestedDetails = data.details;

                if (typeof data.message === "string" && data.message.trim()) {
                    return data.message.trim();
                }

                if (isRecord(nestedDetails) && typeof nestedDetails.message === "string" && nestedDetails.message.trim()) {
                    return nestedDetails.message.trim();
                }
            }
        }

        if (typeof error.message === "string" && error.message.trim()) {
            return error.message.trim();
        }
    }

    return "Movie action failed. Please try again.";
}

async function createMovieAction(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const poster = formData.get("poster");
    const releaseYear = Number(formData.get("releaseYear") ?? 0);
    const director = String(formData.get("director") ?? "").trim();
    const castInput = String(formData.get("cast") ?? "").trim();
    const priceType = String(formData.get("priceType") ?? "PREMIUM").trim();
    const ageGroup = String(formData.get("ageGroup") ?? "AGE_13_PLUS").trim();
    const genres = formData.getAll("genres").map((value) => String(value));
    const platforms = formData.getAll("platforms").map((value) => String(value));

    const currentUser = await getUserInfo().catch(() => null);
    let userId = pickString(currentUser, ["id", "_id", "userId", "sub"]);

    if (!userId && isRecord(currentUser)) {
        for (const nestedKey of ["user", "admin", "profile", "data"]) {
            const nested = currentUser[nestedKey];
            if (isRecord(nested)) {
                userId = pickString(nested, ["id", "_id", "userId", "sub"]);
                if (userId) {
                    break;
                }
            }
        }
    }

    if (!userId) {
        try {
            const cookieStore = await cookies();
            const accessTokenRaw = cookieStore.get("accessToken")?.value ?? "";
            if (accessTokenRaw) {
                const parts = accessTokenRaw.split(".");
                if (parts.length >= 2) {
                    const raw = parts[1].replace(/-/g, "+").replace(/_/g, "/");
                    const padded = raw + "=".repeat((4 - (raw.length % 4)) % 4);
                    const jwtPayload = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as {
                        sub?: string;
                        userId?: string;
                        id?: string;
                        _id?: string;
                    };
                    userId = jwtPayload.sub ?? jwtPayload.userId ?? jwtPayload.id ?? jwtPayload._id ?? "";
                }
            }
        } catch {
            // Leave userId empty when token parsing fails.
        }
    }

    const hasPoster = poster instanceof File && poster.size > 0;
    if (!title || !description || !director || !userId || !releaseYear || !hasPoster) {
        redirect(buildActionRedirectPath({ create: true, error: "Please fill all required fields and attach a poster image." }));
    }

    const cast = castInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    const payload = new FormData();
    payload.append("title", title);
    payload.append("description", description);
    payload.append("poster", poster);
    payload.append("releaseYear", String(releaseYear));
    payload.append("director", director);
    payload.append("priceType", priceType);
    payload.append("ageGroup", ageGroup);
    payload.append("userId", userId);

    for (const item of cast) {
        payload.append("cast", item);
    }

    for (const genre of genres) {
        payload.append("genres", genre);
    }

    for (const platform of platforms) {
        payload.append("platforms", platform);
    }

    try {
        await createAdminMovie(payload);
    } catch (error) {
        console.error("Failed to create movie:", error);
        const rawMessage = extractActionErrorMessage(error);
        const isReadonlyFsError = /EROFS|read-only file system/i.test(rawMessage);
        const isRecordNotFound = /record not found|not found/i.test(rawMessage);
        const message = isReadonlyFsError
            ? "Poster upload failed because the server uses a read-only filesystem. Configure backend upload storage and try again."
            : isRecordNotFound
                ? `${rawMessage} [Debug: userId="${userId}"]`
                : rawMessage;

        redirect(buildActionRedirectPath({ create: true, error: message }));
    }

    revalidatePath("/admin/movie-management/create-movies");
    revalidatePath("/admin/movie-management/view-movies");
    redirect(buildActionRedirectPath({ success: "Movie created successfully." }));
}

async function updateMovieAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const releaseYear = Number(formData.get("releaseYear") ?? 0);
    const priceType = String(formData.get("priceType") ?? "PREMIUM");
    const ageGroup = String(formData.get("ageGroup") ?? "AGE_13_PLUS");
    const director = String(formData.get("director") ?? "").trim();

    if (!id || !title) {
        return;
    }

    try {
        await updateAdminMovie(id, {
            title,
            description,
            releaseYear,
            priceType,
            ageGroup,
            director,
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

export default async function AdminViewMoviesPage({
    searchParams,
}: {
    searchParams: Promise<PageSearchParams>;
}) {
    const params = await searchParams;
    const errorMessage = typeof params.error === "string" ? params.error.trim() : "";
    const successMessage = typeof params.success === "string" ? params.success.trim() : "";

    const [moviesResponse, rawGenres, rawPlatforms, userResult] = await Promise.all([
        getAdminMovies().catch(() => ({ data: [] })),
        getAdminGenres().catch(() => []),
        getAdminStreamingPlatforms().catch(() => []),
        getUserInfo().catch(() => null),
    ]);

    const genres = normalizeOptions(rawGenres, "genre");
    const platforms = normalizeOptions(rawPlatforms, "platform");
    const allMovies = normalizeMovies(moviesResponse.data);
    const adminName = pickString(userResult, ["name", "fullName", "username"], "Logged in admin");

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
                            {/* <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-700" type="button">
                                <Bell className="size-4" />
                            </button> */}
                            <Link href="/admin/dashboard" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-700">
                                <Home className="size-4" />
                            </Link>
                        </div>
                    </header>

                    <main className="p-4 sm:p-6">
                        <div className="mx-auto max-w-7xl space-y-5">
                            {/* <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-sm text-slate-500">Admin / Movie Management / View Movies</p>
                                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">View Movies With Filters</h1>
                                <p className="mt-2 text-sm text-slate-600">Browse movies as cards, open details in a modal, and create new entries from the same screen.</p>
                                <p className="mt-1 text-xs text-slate-500">Creating as: {adminName}</p>
                                {errorMessage ? (
                                    <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                        {errorMessage}
                                    </div>
                                ) : null}
                                {successMessage ? (
                                    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                                        {successMessage}
                                    </div>
                                ) : null}
                            </section> */}

                            <MovieViewClient
                                movies={allMovies}
                                genres={genres}
                                platforms={platforms}
                                adminName={adminName}
                                initialCreateOpen={params.create === "1"}
                                createMovieAction={createMovieAction}
                                updateMovieAction={updateMovieAction}
                                deleteMovieAction={deleteMovieAction}
                                deleteAllMoviesAction={deleteAllMoviesAction}
                                actionError={errorMessage}
                            />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
