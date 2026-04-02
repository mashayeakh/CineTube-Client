import Link from "next/link";
import {
    Bell,
    Home,
    Search,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminCategoryManagementPage() {
    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/category-management" />

                <div className="min-w-0">
                    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Category Management</p>
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
                        <div className="mx-auto max-w-6xl space-y-4">
                            <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-sm text-slate-500">Admin / Category Management</p>
                                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Category Management</h1>
                                <p className="mt-2 text-sm text-slate-600">Manage genre and streaming platform catalogs from dedicated CRUD pages.</p>
                            </header>

                            <section className="grid gap-4 md:grid-cols-2">
                                <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <h2 className="text-xl font-semibold text-slate-900">Genres</h2>
                                    <p className="mt-2 text-sm text-slate-600">
                                        Create, update, and delete genres that are used across movie listings.
                                    </p>
                                    <div className="mt-4">
                                        <Link
                                            href="/admin/category-management/genres"
                                            className="rounded-lg border border-slate-300 bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                                        >
                                            Open Genre CRUD
                                        </Link>
                                    </div>
                                </article>

                                <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <h2 className="text-xl font-semibold text-slate-900">Streaming Platforms</h2>
                                    <p className="mt-2 text-sm text-slate-600">
                                        Manage OTT/streaming providers and keep platform metadata up to date.
                                    </p>
                                    <div className="mt-4">
                                        <Link
                                            href="/admin/category-management/streaming-platforms"
                                            className="rounded-lg border border-slate-300 bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                                        >
                                            Open Platform CRUD
                                        </Link>
                                    </div>
                                </article>
                            </section>

                            {/* <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h2 className="text-lg font-semibold text-slate-900">Quick Navigation</h2>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <Link
                                        href="/admin/dashboard"
                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Back to Dashboard
                                    </Link>
                                </div>
                            </section> */}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
