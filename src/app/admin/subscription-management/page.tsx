import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Bell, Home, Search } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SubscriptionTableClient } from "@/components/admin/subscription-table-client";
import {
    activateAdminDashboardSubscription,
    getAdminDashboardSubscriptions,
    getAdminDashboardSubscriptionStats,
    rejectAdminDashboardSubscription,
} from "@/service/admin-dashboard.services";

type UnknownRecord = Record<string, unknown>;

type SubscriptionRow = {
    id: string;
    userName: string;
    userEmail: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
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

function pickNumber(source: unknown, keys: string[], fallback = 0) {
    if (!isRecord(source)) {
        return fallback;
    }

    for (const key of keys) {
        const value = source[key];

        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }

        if (typeof value === "string") {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) {
                return parsed;
            }
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

function normalizeSubscriptions(raw: unknown): SubscriptionRow[] {
    const list = extractArray(raw, ["subscriptions", "items", "result", "data", "rows", "records"]);

    return list
        .map((item, index) => {
            const user = isRecord(item) ? (item.user ?? item.customer ?? item.subscriber) : null;

            return {
                id: pickString(item, ["id", "_id", "subscriptionId"], `subscription-${index + 1}`),
                userName: pickString(user, ["name", "fullName", "username"], pickString(item, ["userName", "subscriberName"], "Unknown user")),
                userEmail: pickString(user, ["email"], pickString(item, ["userEmail", "subscriberEmail"], "N/A")),
                type: pickString(item, ["type", "subscriptionType", "plan"], "MONTHLY").toUpperCase(),
                status: pickString(item, ["status", "subscriptionStatus"], "PENDING").toUpperCase(),
                startDate: pickString(item, ["startDate", "createdAt", "startsAt"], ""),
                endDate: pickString(item, ["endDate", "expiresAt", "endsAt"], ""),
            };
        })
        .filter((item) => Boolean(item.id));
}

async function activateSubscriptionAction(formData: FormData) {
    "use server";

    const subscriptionId = String(formData.get("subscriptionId") ?? "");

    if (!subscriptionId) {
        return;
    }

    try {
        await activateAdminDashboardSubscription(subscriptionId);
    } catch (error) {
        console.error("Failed to activate subscription:", error);
    }

    revalidatePath("/admin/subscription-management");
    revalidatePath("/admin/dashboard");
    revalidatePath("/user/subscription");
    revalidatePath("/user/contributions");
}

async function rejectSubscriptionAction(formData: FormData) {
    "use server";

    const subscriptionId = String(formData.get("subscriptionId") ?? "");

    if (!subscriptionId) {
        return;
    }

    try {
        await rejectAdminDashboardSubscription(subscriptionId);
    } catch (error) {
        console.error("Failed to reject subscription:", error);
    }

    revalidatePath("/admin/subscription-management");
    revalidatePath("/admin/dashboard");
    revalidatePath("/user/subscription");
    revalidatePath("/user/contributions");
}

export default async function AdminSubscriptionManagementPage() {
    const [rawSubscriptions, statsPayload] = await Promise.all([
        getAdminDashboardSubscriptions().catch(() => []),
        getAdminDashboardSubscriptionStats().catch(() => ({})),
    ]);

    const subscriptions = normalizeSubscriptions(rawSubscriptions);
    const statsData = isRecord(statsPayload) && "data" in statsPayload ? statsPayload.data : {};
    const pendingCount = pickNumber(statsData, ["pending", "pendingCount", "pendingSubscriptions"]);
    const activeCount = pickNumber(statsData, ["active", "activeCount", "activeSubscriptions"]);
    const rejectedCount = pickNumber(statsData, ["rejected", "rejectedCount", "cancelled", "cancelledCount"]);

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/subscription-management" />

                <div className="min-w-0">
                    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Subscription Management</p>
                            <p className="text-xs text-slate-500">Activate or reject paid subscriptions</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500 md:flex">
                                <Search className="size-4" />
                                Search
                            </div>
                            <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-700" type="button">
                                <Bell className="size-4" />
                            </button>
                            <Link href="/admin/dashboard" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-700">
                                <Home className="size-4" />
                            </Link>
                        </div>
                    </header>

                    <main className="p-4 sm:p-6">
                        <div className="mx-auto max-w-7xl space-y-5">
                            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-sm text-slate-500">Admin / Subscription Management</p>
                                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Subscription Approval Desk</h1>
                                <p className="mt-2 text-sm text-slate-600">
                                    User payments are completed by Stripe first. Then admin activates or rejects subscriptions here.
                                </p>

                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    <article className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                                        <p className="text-xs uppercase tracking-wider text-amber-700">Pending</p>
                                        <p className="mt-1 text-lg font-semibold text-amber-800">{pendingCount}</p>
                                    </article>
                                    <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                                        <p className="text-xs uppercase tracking-wider text-emerald-700">Active</p>
                                        <p className="mt-1 text-lg font-semibold text-emerald-800">{activeCount}</p>
                                    </article>
                                    <article className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                                        <p className="text-xs uppercase tracking-wider text-rose-700">Rejected</p>
                                        <p className="mt-1 text-lg font-semibold text-rose-800">{rejectedCount}</p>
                                    </article>
                                </div>
                            </section>

                            <SubscriptionTableClient
                                subscriptions={subscriptions}
                                activateSubscriptionAction={activateSubscriptionAction}
                                rejectSubscriptionAction={rejectSubscriptionAction}
                            />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
