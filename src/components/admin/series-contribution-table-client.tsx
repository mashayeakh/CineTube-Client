"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Search, XCircle } from "lucide-react";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";

type ContributionRow = {
    id: string;
    seriesTitle: string;
    contributorName: string;
    contributorEmail: string;
    status: string;
    createdAt: string;
    details: Record<string, unknown>;
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

function collectDetailEntries(source: Record<string, unknown>) {
    const entries: Array<{ key: string; value: string }> = [];
    const excluded = new Set([
        "id", "contributionId", "seriesId", "seriesTitle", "title", "name", "status", "createdAt",
        "contributorId", "contributorName", "contributorEmail",
        "contributor.id", "contributor.name", "contributor.email",
    ]);

    const pushEntry = (key: string, value: unknown) => {
        if (!key || excluded.has(key)) {
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

type SeriesContributionTableClientProps = {
    contributions: ContributionRow[];
    approveContributionAction: (formData: FormData) => Promise<void>;
    rejectContributionAction: (formData: FormData) => Promise<void>;
};

export function SeriesContributionTableClient({
    contributions,
    approveContributionAction,
    rejectContributionAction,
}: SeriesContributionTableClientProps) {
    const [query, setQuery] = useState("");
    const [selectedContribution, setSelectedContribution] = useState<ContributionRow | null>(null);

    const filteredContributions = useMemo(() => {
        const q = query.trim().toLowerCase();

        if (!q) {
            return contributions;
        }

        return contributions.filter((item) => {
            return (
                item.seriesTitle.toLowerCase().includes(q) ||
                item.contributorName.toLowerCase().includes(q) ||
                item.contributorEmail.toLowerCase().includes(q) ||
                item.status.toLowerCase().includes(q)
            );
        });
    }, [contributions, query]);

    return (
        <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.07)] backdrop-blur">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search series, contributor, email, status"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                    />
                </div>
                <p className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Showing {filteredContributions.length} of {contributions.length}</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-220 text-left text-sm">
                    <thead className="bg-slate-50/80 text-slate-600">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Series</th>
                            <th className="px-4 py-3 font-semibold">Contributor</th>
                            <th className="px-4 py-3 font-semibold">Email</th>
                            <th className="px-4 py-3 font-semibold">Submitted At</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContributions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">No series contributions found for this search.</td>
                            </tr>
                        ) : (
                            filteredContributions.map((item) => (
                                <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                                    <td className="px-4 py-3 font-medium text-slate-900">{item.seriesTitle}</td>
                                    <td className="px-4 py-3 text-slate-700">{item.contributorName}</td>
                                    <td className="px-4 py-3 text-slate-700">{item.contributorEmail}</td>
                                    <td className="px-4 py-3 text-slate-700">{isIsoDate(item.createdAt) ? formatDate(item.createdAt) : item.createdAt}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.status.includes("APPROV")
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
                                                onClick={() => setSelectedContribution(item)}
                                                className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                                            >
                                                View
                                            </button>
                                            <form action={approveContributionAction}>
                                                <input type="hidden" name="contributionId" value={item.id} />
                                                <PendingSubmitButton pendingText="Approving..." className="h-9 rounded-xl border border-emerald-200 bg-white px-3 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50">
                                                    <CheckCircle2 className="size-3" />
                                                    Approve
                                                </PendingSubmitButton>
                                            </form>
                                            <form action={rejectContributionAction}>
                                                <input type="hidden" name="contributionId" value={item.id} />
                                                <PendingSubmitButton pendingText="Rejecting..." className="h-9 rounded-xl border border-rose-200 bg-white px-3 text-xs font-medium text-rose-600 transition hover:bg-rose-50">
                                                    <XCircle className="size-3" />
                                                    Reject
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

            {selectedContribution ? (
                <div
                    className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/55 p-3 sm:p-4"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setSelectedContribution(null)}
                >
                    <div className="mx-auto flex min-h-full items-start justify-center sm:items-center">
                        <div
                            className="my-4 flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_65px_rgba(15,23,42,0.3)]"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="border-b border-slate-200 bg-[linear-gradient(120deg,#0f172a_0%,#1e293b_45%,#334155_100%)] px-5 py-4 text-white">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-slate-300">Contribution Details</p>
                                        <h3 className="mt-1 text-2xl font-semibold tracking-tight text-white">{selectedContribution.seriesTitle}</h3>
                                        <p className="mt-1 text-xs text-slate-300">Review submission metadata and moderation context.</p>
                                    </div>
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${selectedContribution.status.includes("APPROV")
                                        ? "bg-emerald-400/20 text-emerald-200"
                                        : selectedContribution.status.includes("REJECT")
                                            ? "bg-rose-400/20 text-rose-200"
                                            : "bg-amber-400/20 text-amber-200"
                                        }`}>
                                        {selectedContribution.status}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedContribution(null)}
                                    className="absolute right-6 top-5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:bg-white/20"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="max-h-[78vh] overflow-y-auto p-5">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-xs uppercase tracking-wider text-slate-500">Contribution ID</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900 break-all">{selectedContribution.id}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-xs uppercase tracking-wider text-slate-500">Submitted At</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900">{isIsoDate(selectedContribution.createdAt) ? formatDate(selectedContribution.createdAt) : selectedContribution.createdAt}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-xs uppercase tracking-wider text-slate-500">Contributor</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900">{selectedContribution.contributorName}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-xs uppercase tracking-wider text-slate-500">Email</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900 break-all">{selectedContribution.contributorEmail}</p>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="mb-3 flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-slate-800">Additional Info</p>
                                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
                                            {collectDetailEntries(selectedContribution.details).length} fields
                                        </span>
                                    </div>

                                    {collectDetailEntries(selectedContribution.details).length === 0 ? (
                                        <p className="text-sm text-slate-600">No additional information available.</p>
                                    ) : (
                                        <dl className="grid gap-2 md:grid-cols-2">
                                            {collectDetailEntries(selectedContribution.details).map((entry) => (
                                                <div key={`${entry.key}-${entry.value}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                                                    <dt className="text-[11px] uppercase tracking-wider text-slate-500">{entry.key}</dt>
                                                    <dd className="mt-1 text-sm font-medium text-slate-800 break-all">{entry.value}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
