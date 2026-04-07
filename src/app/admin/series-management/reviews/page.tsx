import Link from "next/link";
import { Home, MessageSquareText, Search } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAdminReviews } from "@/service/admin-review.services";

type UnknownRecord = Record<string, unknown>;

type ReviewRow = {
    id: string;
    title: string;
    reviewer: string;
    status: string;
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

function normalizeSeriesLikeReviews(raw: unknown): ReviewRow[] {
    const list = extractArray(raw, ["reviews", "items", "result", "data", "rows", "records"]);

    return list
        .map((item, index) => {
            const seriesObject = isRecord(item) ? (item.series ?? item.show ?? item.content) : null;
            const userObject = isRecord(item) ? (item.user ?? item.reviewer) : null;

            return {
                id: pickString(item, ["id", "_id", "reviewId"], `review-${index + 1}`),
                title: pickString(seriesObject, ["title", "name"], pickString(item, ["seriesTitle", "title"], "Unknown title")),
                reviewer: pickString(userObject, ["name", "fullName", "username"], pickString(item, ["reviewerName", "author"], "Unknown")),
                status: pickString(item, ["status", "state"], "PENDING").toUpperCase(),
            };
        })
        .filter((item) => Boolean(item.id));
}

export default async function AdminSeriesReviewsPage() {
    const rawReviews = await getAdminReviews().catch(() => []);
    const rows = normalizeSeriesLikeReviews(rawReviews);

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/series-management/reviews" />

                <div className="min-w-0">
                    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Series Management</p>
                            <p className="text-xs text-slate-500">Reviews</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500 md:flex">
                                <Search className="size-4" />
                                Search
                            </div>
                            <Link href="/admin/dashboard" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-700">
                                <Home className="size-4" />
                            </Link>
                        </div>
                    </header>

                    <main className="p-4 sm:p-6">
                        <div className="mx-auto max-w-5xl space-y-5">
                            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight text-slate-900">
                                    <MessageSquareText className="size-7 text-blue-600" />
                                    Reviews
                                </h1>
                                <p className="mt-2 text-sm text-slate-600">Series review moderation list.</p>
                            </section>

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                {rows.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-slate-500">No review records found.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                                                <tr>
                                                    <th className="px-4 py-3">Series</th>
                                                    <th className="px-4 py-3">Reviewer</th>
                                                    <th className="px-4 py-3">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {rows.map((row) => (
                                                    <tr key={row.id}>
                                                        <td className="px-4 py-3 font-medium text-slate-900">{row.title}</td>
                                                        <td className="px-4 py-3 text-slate-700">{row.reviewer}</td>
                                                        <td className="px-4 py-3 text-slate-700">{row.status}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
