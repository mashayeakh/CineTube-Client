import Link from "next/link";
import { revalidatePath } from "next/cache";
import {
    Bell,
    Home,
    Search,
    Trash2,
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

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/category-management/genres" />

                <div className="min-w-0">
                    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Genre Management</p>
                            <p className="text-xs text-slate-500">Admin tools</p>
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
                            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-sm text-slate-500">Admin / Category Management / Genres</p>
                                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Genres CRUD</h1>
                                <p className="mt-2 text-sm text-slate-600">Create, update, and delete genres used by the movie catalog.</p>
                            </section>

                            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h2 className="text-xl font-semibold text-slate-900">Create Genre</h2>
                                <form action={createGenreAction} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                                    <input
                                        name="name"
                                        required
                                        placeholder="Genre name"
                                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                                    />
                                    <input
                                        name="slug"
                                        placeholder="genre-slug"
                                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                                    />
                                    <PendingSubmitButton pendingText="Adding..." className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800">
                                        Add Genre
                                    </PendingSubmitButton>
                                </form>
                            </section>

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-180 text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-600">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Name</th>
                                                <th className="px-4 py-3 font-semibold">Slug</th>
                                                <th className="px-4 py-3 font-semibold">Status</th>
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
                                                    <tr key={genre.id} className="border-t border-slate-200 align-top">
                                                        <td className="px-4 py-3" colSpan={4}>
                                                            <div className="grid gap-3 md:grid-cols-[1fr_1fr_180px_auto_auto] md:items-center">
                                                                <form action={updateGenreAction} className="contents">
                                                                    <input type="hidden" name="id" value={genre.id} />
                                                                    <input
                                                                        name="name"
                                                                        defaultValue={genre.name}
                                                                        className="h-8 w-full rounded-md border border-slate-200 px-2 text-sm"
                                                                    />
                                                                    <input
                                                                        name="slug"
                                                                        defaultValue={genre.slug}
                                                                        className="h-8 w-full rounded-md border border-slate-200 px-2 text-sm"
                                                                    />
                                                                    {/* <div className="flex items-center gap-2">
                                                                        <select
                                                                            name="isActive"
                                                                            defaultValue={genre.isActive ? "true" : "false"}
                                                                            className="h-8 rounded-md border border-slate-200 px-2 text-xs"
                                                                        >
                                                                            <option value="true">Active</option>
                                                                            <option value="false">Inactive</option>
                                                                        </select>
                                                                        <Badge variant={genre.isActive ? "default" : "secondary"}>{genre.isActive ? "ACTIVE" : "INACTIVE"}</Badge>
                                                                    </div> */}
                                                                    <PendingSubmitButton pendingText="Saving..." className="h-8 rounded-md border border-slate-300 px-3 text-xs font-medium hover:bg-slate-50">
                                                                        Save
                                                                    </PendingSubmitButton>
                                                                </form>
                                                                <form action={deleteGenreAction}>
                                                                    <input type="hidden" name="id" value={genre.id} />
                                                                    <PendingSubmitButton
                                                                        pendingText="Deleting..."
                                                                        className="inline-flex h-8 items-center gap-1 rounded-md border border-rose-200 px-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
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
