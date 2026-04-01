"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Search, XCircle } from "lucide-react";

import { PendingSubmitButton } from "@/components/ui/pending-submit-button";

type SubscriptionRow = {
    id: string;
    userName: string;
    userEmail: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
};

type SubscriptionTableClientProps = {
    subscriptions: SubscriptionRow[];
    activateSubscriptionAction: (formData: FormData) => Promise<void>;
    rejectSubscriptionAction: (formData: FormData) => Promise<void>;
};

function formatDate(raw: string) {
    const date = new Date(raw);

    if (Number.isNaN(date.getTime())) {
        return "N/A";
    }

    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function badgeClass(status: string) {
    const normalized = status.toLowerCase();

    if (normalized.includes("active") || normalized.includes("complete")) {
        return "bg-emerald-100 text-emerald-700";
    }

    if (normalized.includes("reject") || normalized.includes("cancel") || normalized.includes("fail")) {
        return "bg-rose-100 text-rose-700";
    }

    return "bg-amber-100 text-amber-700";
}

export function SubscriptionTableClient({
    subscriptions,
    activateSubscriptionAction,
    rejectSubscriptionAction,
}: SubscriptionTableClientProps) {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        if (!q) {
            return subscriptions;
        }

        return subscriptions.filter((item) => {
            return (
                item.userName.toLowerCase().includes(q) ||
                item.userEmail.toLowerCase().includes(q) ||
                item.type.toLowerCase().includes(q) ||
                item.status.toLowerCase().includes(q)
            );
        });
    }, [subscriptions, query]);

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search user, email, type, status"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm"
                    />
                </div>
                <p className="text-sm text-slate-600">Showing {filtered.length} of {subscriptions.length}</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-240 text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-4 py-3 font-semibold">User</th>
                            <th className="px-4 py-3 font-semibold">Email</th>
                            <th className="px-4 py-3 font-semibold">Plan</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold">Start</th>
                            <th className="px-4 py-3 font-semibold">End</th>
                            <th className="px-4 py-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                                    No subscriptions found for this search.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((item) => {
                                const isPending = item.status.toLowerCase().includes("pending");

                                return (
                                    <tr key={item.id} className="border-t border-slate-200 hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{item.userName}</td>
                                        <td className="px-4 py-3 text-slate-700">{item.userEmail}</td>
                                        <td className="px-4 py-3 text-slate-700">{item.type}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${badgeClass(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{formatDate(item.startDate)}</td>
                                        <td className="px-4 py-3 text-slate-700">{formatDate(item.endDate)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <form action={activateSubscriptionAction}>
                                                    <input type="hidden" name="subscriptionId" value={item.id} />
                                                    <PendingSubmitButton
                                                        pendingText="Activating..."
                                                        disabled={!isPending}
                                                        className="h-8 rounded-md border border-emerald-200 px-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                                                    >
                                                        <CheckCircle2 className="size-3" />
                                                        Activate
                                                    </PendingSubmitButton>
                                                </form>

                                                <form action={rejectSubscriptionAction}>
                                                    <input type="hidden" name="subscriptionId" value={item.id} />
                                                    <PendingSubmitButton
                                                        pendingText="Rejecting..."
                                                        disabled={!isPending}
                                                        className="h-8 rounded-md border border-rose-200 px-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                                                    >
                                                        <XCircle className="size-3" />
                                                        Reject
                                                    </PendingSubmitButton>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
