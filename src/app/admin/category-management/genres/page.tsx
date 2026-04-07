import Link from "next/link";
import { revalidatePath } from "next/cache";
import {
    Sparkles,
    Home,
    Search,
    Trash2,
    Layers3,
    CircleCheckBig,
    CircleSlash,
} from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import {
    createAdminGenre,
    deleteAdminGenre,
    getAdminGenres,
    updateAdminGenre,
} from "@/service/admin-content.services";

type UnknownRecord = Record<string, unknown>;

type GenreRow = {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
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

function pickBoolean(source: unknown, keys: string[], fallback = true) {
    if (!isRecord(source)) {
        return fallback;
    }

    for (const key of keys) {
        const value = source[key];

        if (typeof value === "boolean") {
            return value;
        }

        if (typeof value === "string") {
            const normalized = value.toLowerCase();

            if (["true", "1", "active", "yes"].includes(normalized)) {
                return true;
            }

            if (["false", "0", "inactive", "no"].includes(normalized)) {
                return false;
            }
        }
    }

    return fallback;
}

function normalizeGenres(raw: unknown): GenreRow[] {
    const list = Array.isArray(raw) ? raw : [];

    return list.map((item, index) => {
        const id = pickString(item, ["_id", "id", "genreId"], `genre-${index + 1}`);
        const name = pickString(item, ["name", "title"], `Genre ${index + 1}`);
        const slug = pickString(item, ["slug"], name.toLowerCase().replace(/\s+/g, "-"));
        const isActive = pickBoolean(item, ["isActive", "active", "status"], true);

        return { id, name, slug, isActive };
    });
}

async function createGenreAction(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();

    if (!name) {
        return;
    }

    try {
        await createAdminGenre({
            name,
            slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
            isActive: true,
        });
    } catch (error) {
        console.error("Failed to create genre:", error);
    }

    revalidatePath("/admin/category-management/genres");
}

async function updateGenreAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();
    const isActive = String(formData.get("isActive") ?? "true") === "true";

    if (!id || !name) {
        return;
    }

    try {
        await updateAdminGenre(id, { name, slug, isActive });
    } catch (error) {
        console.error("Failed to update genre:", error);
    }

    revalidatePath("/admin/category-management/genres");
}

async function deleteGenreAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");

    if (!id) {
        return;
    }

    try {
        await deleteAdminGenre(id);
    } catch (error) {
        console.error("Failed to delete genre:", error);
    }

    revalidatePath("/admin/category-management/genres");
}

export default async function AdminGenresPage() {
    const rawGenres = await getAdminGenres().catch(() => []);
    const genres = normalizeGenres(rawGenres);
    const activeCount = genres.filter((genre) => genre.isActive).length;
    const inactiveCount = genres.length - activeCount;

    return (
        <div className="min-h-screen bg-[radial-gradient(1200px_500px_at_20%_-10%,#dbeafe_0%,transparent_60%),radial-gradient(900px_400px_at_100%_0%,#e2e8f0_0%,transparent_50%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/category-management/genres" />

                <div className="min-w-0">
                    <header className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Genre Management</p>
                            <p className="text-xs text-slate-500">Admin tools</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500 shadow-sm md:flex">
                                <Search className="size-4" />
                                Quick Search
                            </div>
                            {/* <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-700" type="button">
                                <Bell className="size-4" />
                            </button> */}
                            <Link href="/admin/dashboard" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-slate-700">
                                <Home className="size-4" />
                            </Link>
                        </div>
                    </header>

                    <main className="p-4 sm:p-6">
                        <div className="mx-auto max-w-7xl space-y-5">
                            <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_10px_35px_rgba(15,23,42,0.07)] backdrop-blur">
                                <div className="border-b border-slate-100 bg-[linear-gradient(120deg,#0f172a_0%,#1e293b_45%,#334155_100%)] p-6 text-white sm:p-7">
                                    <div className="flex flex-wrap items-start justify-between gap-5">
                                        <div>
                                            <p className="text-sm text-slate-300">Admin / Category Management / Genres</p>
                                            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Genres Management</h1>
                                            <p className="mt-2 max-w-2xl text-sm text-slate-300">Build and maintain your catalog taxonomy with clean genre naming, slug consistency, and quick edit actions.</p>
                                        </div>
                                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
                                            <Sparkles className="size-3.5" />
                                            Modern Admin Surface
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
                                    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs uppercase tracking-wider text-slate-500">Total Genres</p>
                                            <Layers3 className="size-4 text-slate-400" />
                                        </div>
                                        <p className="mt-2 text-3xl font-bold text-slate-900">{genres.length}</p>
                                    </article>
                                    <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs uppercase tracking-wider text-emerald-700">Active</p>
                                            <CircleCheckBig className="size-4 text-emerald-600" />
                                        </div>
                                        <p className="mt-2 text-3xl font-bold text-emerald-800">{activeCount}</p>
                                    </article>
                                    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs uppercase tracking-wider text-slate-500">Inactive</p>
                                            <CircleSlash className="size-4 text-slate-400" />
                                        </div>
                                        <p className="mt-2 text-3xl font-bold text-slate-700">{inactiveCount}</p>
                                    </article>
                                </div>
                            </section>

                            <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.07)] backdrop-blur">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h2 className="text-xl font-semibold text-slate-900">Create Genre</h2>
                                    <p className="text-xs text-slate-500">Use clean names and readable slugs.</p>
                                </div>
                                <form action={createGenreAction} className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 md:grid-cols-[1fr_1fr_auto]">
                                    <label className="space-y-1.5">
                                        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Genre Name</span>
                                        <input
                                            name="name"
                                            required
                                            placeholder="Adventure"
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                                        />
                                    </label>
                                    <label className="space-y-1.5">
                                        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Slug</span>
                                        <input
                                            name="slug"
                                            placeholder="adventure"
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                                        />
                                    </label>
                                    <div className="flex items-end">
                                        <PendingSubmitButton pendingText="Adding..." className="h-11 rounded-xl bg-[linear-gradient(120deg,#0f172a_0%,#1e293b_100%)] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95">
                                            Add Genre
                                        </PendingSubmitButton>
                                    </div>
                                </form>
                            </section>

                            <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_10px_35px_rgba(15,23,42,0.07)] backdrop-blur">
                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                                    <h3 className="text-base font-semibold text-slate-900">Genres List</h3>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{genres.length} items</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-180 text-left text-sm">
                                        <thead className="bg-slate-50/80 text-slate-600">
                                            <tr>
                                                <th className="px-5 py-3 font-semibold sm:px-6">Name</th>
                                                <th className="px-5 py-3 font-semibold sm:px-6">Slug</th>
                                                <th className="px-5 py-3 font-semibold sm:px-6">Status</th>
                                                {/* <th className="px-4 py-3 font-semibold">Actions</th> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {genres.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No genres available yet.</td>
                                                </tr>
                                            ) : (
                                                genres.map((genre) => (
                                                    <tr key={genre.id} className="border-t border-slate-100 align-top">
                                                        <td className="px-5 py-3 sm:px-6" colSpan={4}>
                                                            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md md:grid-cols-[1fr_1fr_180px_auto_auto] md:items-center">
                                                                <form action={updateGenreAction} className="contents">
                                                                    <input type="hidden" name="id" value={genre.id} />
                                                                    <input
                                                                        name="name"
                                                                        defaultValue={genre.name}
                                                                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                                                                    />
                                                                    <input
                                                                        name="slug"
                                                                        defaultValue={genre.slug}
                                                                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                                                                    />
                                                                    <div className="flex items-center">
                                                                        <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${genre.isActive
                                                                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                            : "border border-slate-200 bg-slate-100 text-slate-600"
                                                                            }`}>
                                                                            {genre.isActive ? "ACTIVE" : "INACTIVE"}
                                                                        </span>
                                                                        <input type="hidden" name="isActive" value={genre.isActive ? "true" : "false"} />
                                                                    </div>
                                                                    <PendingSubmitButton pendingText="Saving..." className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                                                                        Save
                                                                    </PendingSubmitButton>
                                                                </form>
                                                                <form action={deleteGenreAction}>
                                                                    <input type="hidden" name="id" value={genre.id} />
                                                                    <PendingSubmitButton
                                                                        pendingText="Deleting..."
                                                                        className="inline-flex h-10 items-center gap-1 rounded-xl border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                                                                    >
                                                                        <Trash2 className="size-3" />
                                                                        Delete
                                                                    </PendingSubmitButton>
                                                                </form>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </div >
        </div >
    );
}
