import Link from "next/link";
import { revalidatePath } from "next/cache";
import {
    Sparkles,
    Home,
    Search,
    Tv,
    Clapperboard,
    Film,
} from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import {
    createAdminStreamingPlatform,
    deleteAdminStreamingPlatform,
    getAdminStreamingPlatforms,
    updateAdminStreamingPlatform,
} from "@/service/admin-content.services";

type UnknownRecord = Record<string, unknown>;

type PlatformRow = {
    id: string;
    name: string;
    movieCount: number;
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

function normalizePlatforms(raw: unknown): PlatformRow[] {
    const list = Array.isArray(raw) ? raw : [];

    return list.map((item, index) => {
        const id = pickString(item, ["_id", "id", "platformId"], `platform-${index + 1}`);
        const name = pickString(item, ["name", "title"], `Platform ${index + 1}`);
        const movieCount = isRecord(item) && Array.isArray(item.movies) ? item.movies.length : 0;

        return { id, name, movieCount };
    });
}

async function createPlatformAction(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();

    if (!name) {
        return;
    }

    try {
        await createAdminStreamingPlatform({
            name,
        });
    } catch (error) {
        console.error("Failed to create streaming platform:", error);
    }

    revalidatePath("/admin/category-management/streaming-platforms");
}

async function updatePlatformAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");
    const name = String(formData.get("name") ?? "").trim();

    if (!id || !name) {
        return;
    }

    try {
        await updateAdminStreamingPlatform(id, { name });
    } catch (error) {
        console.error("Failed to update streaming platform:", error);
    }

    revalidatePath("/admin/category-management/streaming-platforms");
}

async function deletePlatformAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");

    if (!id) {
        return;
    }

    try {
        await deleteAdminStreamingPlatform(id);
    } catch (error) {
        console.error("Failed to delete streaming platform:", error);
    }

    revalidatePath("/admin/category-management/streaming-platforms");
}

export default async function AdminStreamingPlatformsPage() {
    const rawPlatforms = await getAdminStreamingPlatforms().catch(() => []);
    const platforms = normalizePlatforms(rawPlatforms);
    const totalLinkedMovies = platforms.reduce((total, platform) => total + platform.movieCount, 0);
    const unusedPlatforms = platforms.filter((platform) => platform.movieCount === 0).length;

    return (
        <div className="min-h-screen bg-[radial-gradient(1200px_500px_at_20%_-10%,#dbeafe_0%,transparent_60%),radial-gradient(900px_400px_at_100%_0%,#e2e8f0_0%,transparent_50%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/category-management/streaming-platforms" />

                <div className="min-w-0">
                    <header className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Streaming Platform Management</p>
                            <p className="text-xs text-slate-500">Admin tools</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500 shadow-sm md:flex">
                                <Search className="size-4" />
                                Quick Search
                            </div>
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
                                            <p className="text-sm text-slate-300">Admin / Category Management / Streaming Platforms</p>
                                            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Streaming Platforms</h1>
                                            <p className="mt-2 max-w-2xl text-sm text-slate-300">Manage OTT providers used by movies and filters, and keep catalog platform data consistent.</p>
                                        </div>
                                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
                                            <Sparkles className="size-3.5" />
                                            Distribution Catalog
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
                                    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs uppercase tracking-wider text-slate-500">Total Platforms</p>
                                            <Tv className="size-4 text-slate-400" />
                                        </div>
                                        <p className="mt-2 text-3xl font-bold text-slate-900">{platforms.length}</p>
                                    </article>
                                    <article className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs uppercase tracking-wider text-indigo-700">Linked Movies</p>
                                            <Clapperboard className="size-4 text-indigo-600" />
                                        </div>
                                        <p className="mt-2 text-3xl font-bold text-indigo-800">{totalLinkedMovies}</p>
                                    </article>
                                    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs uppercase tracking-wider text-slate-500">Unused</p>
                                            <Film className="size-4 text-slate-400" />
                                        </div>
                                        <p className="mt-2 text-3xl font-bold text-slate-700">{unusedPlatforms}</p>
                                    </article>
                                </div>
                            </section>

                            <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.07)] backdrop-blur">
                                <h2 className="text-xl font-semibold text-slate-900">Create Platform</h2>
                                <form action={createPlatformAction} className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 md:grid-cols-[1fr_auto]">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">Platform Name</label>
                                        <input
                                            name="name"
                                            required
                                            placeholder="Netflix"
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <PendingSubmitButton pendingText="Adding..." className="h-11 rounded-xl bg-[linear-gradient(120deg,#0f172a_0%,#1e293b_100%)] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95">
                                            Add Platform
                                        </PendingSubmitButton>
                                    </div>
                                </form>
                            </section>

                            <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_10px_35px_rgba(15,23,42,0.07)] backdrop-blur">
                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                                    <h3 className="text-base font-semibold text-slate-900">Platforms List</h3>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{platforms.length} items</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-180 text-left text-sm">
                                        <thead className="bg-slate-50/80 text-slate-600">
                                            <tr>
                                                <th className="px-5 py-3 font-semibold sm:px-6">Name</th>
                                                <th className="px-5 py-3 font-semibold sm:px-6">Linked Movies</th>
                                                <th className="px-5 py-3 font-semibold sm:px-6">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {platforms.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500">No streaming platforms available yet.</td>
                                                </tr>
                                            ) : (
                                                platforms.map((platform) => (
                                                    <tr key={platform.id} className="border-t border-slate-100 align-top">
                                                        <td className="px-5 py-3 sm:px-6" colSpan={3}>
                                                            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md md:grid-cols-[1fr_120px_auto_auto] md:items-center">
                                                                <form action={updatePlatformAction} className="contents">
                                                                    <input type="hidden" name="id" value={platform.id} />
                                                                    <input
                                                                        name="name"
                                                                        defaultValue={platform.name}
                                                                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                                                                    />
                                                                    <span className="text-xs font-semibold text-slate-600">{platform.movieCount} movies</span>
                                                                    <PendingSubmitButton pendingText="Saving..." className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                                                                        <Tv className="size-3" />
                                                                        Save
                                                                    </PendingSubmitButton>
                                                                </form>
                                                                <form action={deletePlatformAction}>
                                                                    <input type="hidden" name="id" value={platform.id} />
                                                                    <PendingSubmitButton
                                                                        pendingText="Deleting..."
                                                                        className="inline-flex h-10 items-center gap-1 rounded-xl border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                                                                    >
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
