"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Search, XCircle } from "lucide-react";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";

type ReviewRow = {
    id: string;
    movieTitle: string;
    moviePoster: string;
    reviewerName: string;
    reviewerEmail: string;
    rating: number;
    content: string;
    status: string;
    createdAt: string;
    details: Record<string, unknown>;
};

type ReviewTableClientProps = {
    reviews: ReviewRow[];
    approveReviewAction: (formData: FormData) => Promise<void>;
    rejectReviewAction: (formData: FormData) => Promise<void>;
};

function prettifyKey(key: string) {
    return key
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[._-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^./, (char) => char.toUpperCase());
}

function formatDate(raw: string) {
    const date = new Date(raw);
    if (isNaN(date.getTime())) return raw;
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function isIsoDate(value: string) {
    return /^\d{4}-\d{2}-\d{2}T/.test(value);
}

function formatValue(value: unknown) {
    if (value === null) {
        return "null";
    }

    if (value === undefined) {
        return "-";
    }

    if (Array.isArray(value)) {
        return value
            .map((item) => {
                if (typeof item === "object" && item !== null && "name" in item) {
                    return String((item as Record<string, unknown>).name);
                }

                if (typeof item === "string" && isIsoDate(item)) {
                    return formatDate(item);
                }

                return typeof item === "object" && item !== null ? JSON.stringify(item) : String(item);
            })
            .join(", ");
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    if (typeof value === "string" && isIsoDate(value)) {
        return formatDate(value);
    }

    return String(value);
}

function formatCommentsOnly(value: unknown) {
    if (!Array.isArray(value)) {
        return "";
    }

    const comments = value
        .map((item) => {
            if (typeof item === "string") {
                return item.trim();
            }

            if (typeof item === "object" && item !== null) {
                const content = (item as Record<string, unknown>).content;
                return typeof content === "string" ? content.trim() : "";
            }

            return "";
        })
        .filter(Boolean);

    return comments.join(" | ");
}

function collectDetailEntries(source: Record<string, unknown>) {
    const entries: Array<{ key: string; value: string }> = [];
    const excluded = new Set([
        "id", "reviewId", "movieId", "movieTitle", "title", "name", "status", "createdAt",
        "content", "rating", "userId", "reviewerName", "reviewerEmail",
        "user.id", "user.name", "user.email",
        "movie.id", "movie.title",
    ]);

    const pushEntry = (key: string, value: unknown) => {
        if (!key || excluded.has(key)) {
            return;
        }

        if (key.toLowerCase() === "comments") {
            const commentsOnly = formatCommentsOnly(value);

            if (commentsOnly) {
                entries.push({ key: prettifyKey(key), value: commentsOnly });
            }

            return;
        }

        const formatted = formatValue(value);
        if (!formatted || formatted === "{}") {
            return;
        }

        entries.push({ key: prettifyKey(key), value: formatted });
    };

    for (const [key, value] of Object.entries(source)) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
            for (const [childKey, childValue] of Object.entries(value as Record<string, unknown>)) {
                pushEntry(`${key}.${childKey}`, childValue);
            }
            continue;
        }

        pushEntry(key, value);
    }

    return entries;
}

export function ReviewTableClient({ reviews, approveReviewAction, rejectReviewAction }: ReviewTableClientProps) {
    const [query, setQuery] = useState("");
    const [selectedReview, setSelectedReview] = useState<ReviewRow | null>(null);

    const filteredReviews = useMemo(() => {
        const q = query.trim().toLowerCase();

        if (!q) {
            return reviews;
        }

        return reviews.filter((item) => {
            return (
                item.movieTitle.toLowerCase().includes(q)
                || item.reviewerName.toLowerCase().includes(q)
                || item.reviewerEmail.toLowerCase().includes(q)
                || item.status.toLowerCase().includes(q)
                || item.content.toLowerCase().includes(q)
            );
        });
    }, [reviews, query]);

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search movie, reviewer, email, status"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm"
                    />
                </div>
                <p className="text-sm text-slate-600">Showing {filteredReviews.length} of {reviews.length}</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-220 text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Movie</th>
                            <th className="px-4 py-3 font-semibold">Reviewer</th>
                            <th className="px-4 py-3 font-semibold">Email</th>
                            <th className="px-4 py-3 font-semibold">Rating</th>
                            <th className="px-4 py-3 font-semibold">Submitted At</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReviews.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">No reviews found for this search.</td>
                            </tr>
                        ) : (
                            filteredReviews.map((item) => (
                                <tr key={item.id} className="border-t border-slate-200 hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-900">
                                        <div className="flex items-center gap-3">
                                            {item.moviePoster ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={item.moviePoster}
                                                    alt={item.movieTitle}
                                                    className="h-10 w-10 rounded-md border border-slate-200 object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-500">
                                                    N/A
                                                </div>
                                            )}
                                            <span>{item.movieTitle}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">{item.reviewerName}</td>
                                    <td className="px-4 py-3 text-slate-700">{item.reviewerEmail}</td>
                                    <td className="px-4 py-3 text-slate-700">{item.rating || 0}/5</td>
                                    <td className="px-4 py-3 text-slate-700">{isIsoDate(item.createdAt) ? formatDate(item.createdAt) : item.createdAt}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${item.status.includes("APPROV")
                                            ? "bg-emerald-100 text-emerald-700"
                                            : item.status.includes("REJECT")
                                                ? "bg-rose-100 text-rose-700"
                                                : "bg-amber-100 text-amber-700"
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedReview(item)}
                                                className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                            >
                                                View
                                            </button>
                                            <form action={approveReviewAction}>
                                                <input type="hidden" name="reviewId" value={item.id} />
                                                <PendingSubmitButton
                                                    pendingText="Approving..."
                                                    disabled={item.status === "APPROVED"}
                                                    className="h-8 rounded-md border border-emerald-200 px-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50">
                                                    <CheckCircle2 className="size-3" />
                                                    {item.status === "APPROVED" ? "Already Approved" : "Approve"}
                                                </PendingSubmitButton>
                                            </form>
                                            <form action={rejectReviewAction}>
                                                <input type="hidden" name="reviewId" value={item.id} />
                                                <PendingSubmitButton
                                                    pendingText="Rejecting..."
                                                    disabled={item.status === "REJECTED"}
                                                    className="h-8 rounded-md border border-rose-200 px-2 text-xs font-medium text-rose-600 hover:bg-rose-50">
                                                    <XCircle className="size-3" />
                                                    {item.status === "REJECTED" ? "Already Rejected" : "Reject"}
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

            {selectedReview ? (
                <div
                    className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 p-3 sm:p-4"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setSelectedReview(null)}
                >
                    <div className="mx-auto flex min-h-full items-start justify-center sm:items-center">
                        <div
                            className="my-4 flex w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
                                <div>
                                    <p className="text-xs text-slate-500">Review Details</p>
                                    <h3 className="text-lg font-semibold text-slate-900">{selectedReview.movieTitle}</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedReview(null)}
                                    className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="max-h-[78vh] overflow-y-auto p-5">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:col-span-2">
                                        <p className="text-xs text-slate-500">Movie Poster</p>
                                        <div className="mt-2">
                                            {selectedReview.moviePoster ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={selectedReview.moviePoster}
                                                    alt={selectedReview.movieTitle}
                                                    className="h-44 w-full rounded-md border border-slate-200 object-cover md:h-56"
                                                />
                                            ) : (
                                                <div className="flex h-44 w-full items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-sm font-medium text-slate-500 md:h-56">
                                                    No poster available
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-xs text-slate-500">Review ID</p>
                                        <p className="text-sm font-medium text-slate-900 break-all">{selectedReview.id}</p>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-xs text-slate-500">Status</p>
                                        <p className="text-sm font-medium text-slate-900">{selectedReview.status}</p>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-xs text-slate-500">Reviewer</p>
                                        <p className="text-sm font-medium text-slate-900">{selectedReview.reviewerName}</p>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-xs text-slate-500">Email</p>
                                        <p className="text-sm font-medium text-slate-900 break-all">{selectedReview.reviewerEmail}</p>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-xs text-slate-500">Rating</p>
                                        <p className="text-sm font-medium text-slate-900">{selectedReview.rating || 0}/5</p>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-xs text-slate-500">Submitted At</p>
                                        <p className="text-sm font-medium text-slate-900">{isIsoDate(selectedReview.createdAt) ? formatDate(selectedReview.createdAt) : selectedReview.createdAt}</p>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:col-span-2">
                                        <p className="text-xs text-slate-500">Review Content</p>
                                        <p className="text-sm font-medium text-slate-900 whitespace-pre-wrap">{selectedReview.content || "No content"}</p>
                                    </div>

                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:col-span-2">
                                        <p className="mb-2 text-xs text-slate-500">Additional Info</p>
                                        {collectDetailEntries(selectedReview.details).length === 0 ? (
                                            <p className="text-sm text-slate-600">No additional information available.</p>
                                        ) : (
                                            <dl className="grid gap-2 md:grid-cols-2">
                                                {collectDetailEntries(selectedReview.details).map((entry) => (
                                                    <div key={`${entry.key}-${entry.value}`} className="rounded border border-slate-200 bg-white px-2 py-1.5">
                                                        <dt className="text-[11px] text-slate-500">{entry.key}</dt>
                                                        <dd className="text-xs font-medium text-slate-800 break-all">{entry.value}</dd>
                                                    </div>
                                                ))}
                                            </dl>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
