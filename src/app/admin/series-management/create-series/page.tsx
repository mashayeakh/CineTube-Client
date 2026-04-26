import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Home, Search } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { getAdminGenres, getAdminStreamingPlatforms } from "@/service/admin-content.services";
import { getUserInfo } from "@/service/auth.services";
import { createAdminSeries } from "@/service/admin-series.services";

type UnknownRecord = Record<string, unknown>;

type OptionItem = {
    id: string;
    name: string;
};

type PageSearchParams = {
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

function buildActionRedirectPath(params: { error?: string; success?: string }) {
    const query = new URLSearchParams();

    if (params.error) {
        query.set("error", params.error);
    }

    if (params.success) {
        query.set("success", params.success);
    }

    const queryString = query.toString();
    return queryString
        ? `/admin/series-management/create-series?${queryString}`
        : "/admin/series-management/create-series";
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

    return "Failed to create series. Please try again.";
}

async function createSeriesAction(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const poster = formData.get("poster");
    const releaseYear = Number(formData.get("releaseYear") ?? 0);
    const director = String(formData.get("director") ?? "").trim();
    const streamingLink = String(formData.get("streamingLink") ?? "").trim();
    const castInput = String(formData.get("cast") ?? "").trim();
    const priceType = String(formData.get("priceType") ?? "PREMIUM").trim();
    const ageGroup = String(formData.get("ageGroup") ?? "AGE_13_PLUS").trim();
    const genres = formData.getAll("genres").map((value) => String(value));
    const platforms = formData.getAll("platforms").map((value) => String(value));

    // Try profile API first for accurate DB userId; JWT decode is the fallback.
    const currentUser = await getUserInfo().catch(() => null);
    let userId = pickString(currentUser, ["id", "_id", "userId", "sub"]);

    // Also check nested user/admin/profile objects in case response wraps differently
    if (!userId && isRecord(currentUser)) {
        for (const nestedKey of ["user", "admin", "profile", "data"]) {
            const nested = currentUser[nestedKey];
            if (isRecord(nested)) {
                userId = pickString(nested, ["id", "_id", "userId", "sub"]);
                if (userId) break;
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
            // malformed token — userId stays empty
        }
    }

    const hasPoster = poster instanceof File && poster.size > 0;
    if (!title || !description || !director || !userId || !releaseYear || !hasPoster) {
        redirect(buildActionRedirectPath({ error: "Please fill all required fields and attach a poster image." }));
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
    if (streamingLink) {
        payload.append("streamingLink", streamingLink);
    }

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
        await createAdminSeries(payload);
    } catch (error) {
        console.error("Failed to create series:", error);
        const rawMessage = extractActionErrorMessage(error);
        const isReadonlyFsError = /EROFS|read-only file system/i.test(rawMessage);
        const isRecordNotFound = /record not found|not found/i.test(rawMessage);
        const message = isReadonlyFsError
            ? "Poster upload failed because the server uses a read-only filesystem. Configure backend upload storage (for example /tmp or cloud storage) and try again."
            : isRecordNotFound
                ? `${rawMessage} [Debug: userId="${userId}"] — Verify this user exists in the backend database.`
                : rawMessage;

        redirect(buildActionRedirectPath({ error: message }));
    }

    revalidatePath("/admin/series-management/create-series");
    revalidatePath("/admin/series-management/all-series");
    redirect(buildActionRedirectPath({ success: "Series created successfully." }));
}

export default async function AdminCreateSeriesPage({
    searchParams,
}: {
    searchParams: Promise<PageSearchParams>;
}) {
    const params = await searchParams;
    const errorMessage = typeof params.error === "string" ? params.error.trim() : "";
    const successMessage = typeof params.success === "string" ? params.success.trim() : "";

    const [genresResult, platformsResult, userResult] = await Promise.allSettled([
        getAdminGenres(),
        getAdminStreamingPlatforms(),
        getUserInfo(),
    ]);

    const rawGenres = genresResult.status === "fulfilled" ? genresResult.value : [];
    const rawPlatforms = platformsResult.status === "fulfilled" ? platformsResult.value : [];
    const currentUser = userResult.status === "fulfilled" ? userResult.value : null;

    const optionLoadErrors: string[] = [];

    if (genresResult.status === "rejected") {
        optionLoadErrors.push(`Genres: ${extractActionErrorMessage(genresResult.reason)}`);
    }

    if (platformsResult.status === "rejected") {
        optionLoadErrors.push(`Platforms: ${extractActionErrorMessage(platformsResult.reason)}`);
    }

    const genres = normalizeOptions(rawGenres, "genre");
    const platforms = normalizeOptions(rawPlatforms, "platform");
    const adminName = pickString(currentUser, ["name", "fullName", "username"], "Logged in admin");

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/series-management/create-series" />

                <div className="min-w-0">
                    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Series Management</p>
                            <p className="text-xs text-slate-500">Create Series</p>
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
                        <div className="mx-auto max-w-5xl space-y-5">
                            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Create Series</h1>
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

                                {optionLoadErrors.length > 0 ? (
                                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                                        <p className="font-medium">Failed to load selectable options from API.</p>
                                        <p className="mt-1 text-xs">{optionLoadErrors.join(" | ")}</p>
                                    </div>
                                ) : null}
                            </section>

                            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <form action={createSeriesAction} className="space-y-4">
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <input name="title" required placeholder="Series title" className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
                                        <input name="poster" type="file" accept="image/*" required className="h-10 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                                    </div>

                                    <textarea name="description" required placeholder="Description" className="min-h-28 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />

                                    <div className="grid gap-3 md:grid-cols-3">
                                        <input name="director" required placeholder="Director" className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
                                        <input name="releaseYear" required type="number" placeholder="Release year" className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
                                        <input name="streamingLink" type="url" placeholder="streaming link" className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
                                    </div>

                                    <input
                                        name="cast"
                                        placeholder="Cast (comma separated), e.g. Timothee Chalamet, Rebecca Ferguson"
                                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                                    />

                                    <div className="grid gap-3 md:grid-cols-2">
                                        <select name="priceType" defaultValue="PREMIUM" className="h-10 rounded-lg border border-slate-200 px-3 text-sm">
                                            <option value="FREE">FREE</option>
                                            <option value="PREMIUM">PREMIUM</option>
                                        </select>
                                        <select name="ageGroup" defaultValue="AGE_13_PLUS" className="h-10 rounded-lg border border-slate-200 px-3 text-sm">
                                            <option value="AGE_7_PLUS">AGE_7_PLUS</option>
                                            <option value="AGE_13_PLUS">AGE_13_PLUS</option>
                                            <option value="AGE_16_PLUS">AGE_16_PLUS</option>
                                            <option value="AGE_18_PLUS">AGE_18_PLUS</option>
                                        </select>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <fieldset className="rounded-lg border border-slate-200 p-3">
                                            <legend className="px-1 text-sm font-semibold text-slate-800">Genres</legend>
                                            <div className="mt-2 grid max-h-48 gap-2 overflow-auto">
                                                {genres.length === 0 ? (
                                                    <p className="text-sm text-slate-500">No genres found.</p>
                                                ) : (
                                                    genres.map((genre) => (
                                                        <label key={genre.id} className="flex items-center gap-2 text-sm text-slate-700">
                                                            <input type="checkbox" name="genres" value={genre.id} className="size-4" />
                                                            <span>{genre.name}</span>
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                        </fieldset>

                                        <fieldset className="rounded-lg border border-slate-200 p-3">
                                            <legend className="px-1 text-sm font-semibold text-slate-800">Streaming Platforms</legend>
                                            <div className="mt-2 grid max-h-48 gap-2 overflow-auto">
                                                {(
                                                    platforms.map((platform) => (
                                                        <label key={platform.id} className="flex items-center gap-2 text-sm text-slate-700">
                                                            <input type="checkbox" name="platforms" value={platform.id} className="size-4" />
                                                            <span>{platform.name}</span>
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                        </fieldset>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <PendingSubmitButton pendingText="Creating..." className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                                            Create Series
                                        </PendingSubmitButton>
                                        <Link href="/admin/series-management/all-series" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                            View All Series
                                        </Link>
                                    </div>
                                </form>
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
