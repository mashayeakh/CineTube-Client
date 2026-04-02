import Link from "next/link";
import { revalidatePath } from "next/cache";
import {
    Bell,
    Home,
    Search,
    Tv,
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

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/category-management/streaming-platforms" />

                <div className="min-w-0">
                    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Streaming Platform Management</p>
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
                                <p className="text-sm text-slate-500">Admin / Category Management / Streaming Platforms</p>
                                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Streaming Platforms CRUD</h1>
                                <p className="mt-2 text-sm text-slate-600">Manage OTT providers available for movies and filtering.</p>
                            </section>

                            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h2 className="text-xl font-semibold text-slate-900">Create Platform</h2>
                                <form action={createPlatformAction} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                                    <input
                                        name="name"
                                        required
                                        placeholder="Platform name"
                                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                                    />
                                    <PendingSubmitButton pendingText="Adding..." className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800">
                                        Add Platform
                                    </PendingSubmitButton>
                                </form>
                            </section>

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-180 text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-600">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Name</th>
                                                <th className="px-4 py-3 font-semibold">Linked Movies</th>
                                                <th className="px-4 py-3 font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {platforms.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500">No streaming platforms available yet.</td>
                                                </tr>
                                            ) : (
                                                platforms.map((platform) => (
                                                    <tr key={platform.id} className="border-t border-slate-200 align-top">
                                                        <td className="px-4 py-3" colSpan={3}>
                                                            <div className="grid gap-3 md:grid-cols-[1fr_120px_auto_auto] md:items-center">
                                                                <form action={updatePlatformAction} className="contents">
                                                                    <input type="hidden" name="id" value={platform.id} />
                                                                    <input
                                                                        name="name"
                                                                        defaultValue={platform.name}
                                                                        className="h-8 w-full rounded-md border border-slate-200 px-2 text-sm"
                                                                    />
                                                                    <span className="text-xs font-medium text-slate-600">{platform.movieCount} movies</span>
                                                                    <PendingSubmitButton pendingText="Saving..." className="h-8 rounded-md border border-slate-300 px-2 text-xs font-medium hover:bg-slate-50">
                                                                        <Tv className="size-3" />
                                                                        Save
                                                                    </PendingSubmitButton>
                                                                </form>
                                                                <form action={deletePlatformAction}>
                                                                    <input type="hidden" name="id" value={platform.id} />
                                                                    <PendingSubmitButton
                                                                        pendingText="Deleting..."
                                                                        className="inline-flex h-8 items-center gap-1 rounded-md border border-rose-200 px-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
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
