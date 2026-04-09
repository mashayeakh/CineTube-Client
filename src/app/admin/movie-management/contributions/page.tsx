import Link from "next/link";
import { revalidatePath } from "next/cache";
import { CheckCircle2, Clock3, Home, Search, Sparkles, XCircle } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { MovieContributionTableClient } from "@/components/admin/movie-contribution-table-client";
import {
    approveMovieContribution,
    getAdminMovieContributions,
    rejectMovieContribution,
} from "@/service/admin-movie-contribution.services";

type UnknownRecord = Record<string, unknown>;

type ContributionRow = {
    id: string;
    movieTitle: string;
    contributorName: string;
    contributorEmail: string;
    status: string;
    createdAt: string;
    details: UnknownRecord;
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

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "N/A";
    }

    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function normalizeContributions(raw: unknown): ContributionRow[] {
    const list = extractArray(raw, ["contributions", "items", "result", "data", "movies"]);

    return list
        .map((item, index) => {
            const userObject = isRecord(item) ? (item.user ?? item.contributor ?? item.createdBy) : null;
            const contributorName = pickString(userObject, ["name", "fullName", "username"], pickString(item, ["submittedBy", "contributorName"], "Unknown"));
            const contributorEmail = pickString(userObject, ["email"], pickString(item, ["contributorEmail", "email"], "N/A"));

            return {
                id: pickString(item, ["id", "_id", "contributionId", "movieId"], `contribution-${index + 1}`),
                movieTitle: pickString(item, ["movieTitle", "title", "name"], "Untitled movie"),
                contributorName,
                contributorEmail,
                status: pickString(item, ["status", "state"], "PENDING").toUpperCase(),
                createdAt: formatDate(pickString(item, ["createdAt", "submittedAt"], "")),
                details: isRecord(item) ? item : {},
            };
        })
        .filter((item) => Boolean(item.id));
}

async function approveContributionAction(formData: FormData) {
    "use server";

    const contributionId = String(formData.get("contributionId") ?? "");

    if (!contributionId) {
        return;
    }

    try {
        await approveMovieContribution(contributionId);
    } catch (error) {
        console.error("Failed to approve contribution:", error);
    }

    revalidatePath("/admin/movie-management/contributions");
}

async function rejectContributionAction(formData: FormData) {
    "use server";

    const contributionId = String(formData.get("contributionId") ?? "");

    if (!contributionId) {
        return;
    }

    try {
        await rejectMovieContribution(contributionId);
    } catch (error) {
        console.error("Failed to reject contribution:", error);
    }

    revalidatePath("/admin/movie-management/contributions");
}

export default async function AdminMovieContributionsPage() {
    const rawContributions = await getAdminMovieContributions().catch(() => []);

    


    console.log("Raw contributions", rawContributions)

    const contributions = normalizeContributions(rawContributions);
    const approvedCount = contributions.filter((item) => item.status.includes("APPROV")).length;
    const pendingCount = contributions.filter((item) => item.status.includes("PEND")).length;
    const rejectedCount = contributions.filter((item) => item.status.includes("REJECT")).length;

    return (
        <div className="min-h-screen bg-[radial-gradient(1200px_500px_at_20%_-10%,#dbeafe_0%,transparent_60%),radial-gradient(900px_400px_at_100%_0%,#e2e8f0_0%,transparent_50%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/movie-management/contributions" />

                <div className="min-w-0">
                    <header className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Movie Management</p>
                            <p className="text-xs text-slate-500">Contributions handler</p>
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
                                            <p className="text-sm text-slate-300">Admin / Movie Management / Contributions</p>
                                            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Movie Contribution Handler</h1>
                                            <p className="mt-2 max-w-2xl text-sm text-slate-300">Review incoming movie submissions, inspect details, and approve or reject with confidence.</p>
                                        </div>
                                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
                                            <Sparkles className="size-3.5" />
                                            Moderation Desk
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
                                    <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs uppercase tracking-wider text-amber-700">Pending</p>
                                            <Clock3 className="size-4 text-amber-600" />
                                        </div>
                                        <p className="mt-2 text-3xl font-bold text-amber-800">{pendingCount}</p>
                                    </article>
                                    <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs uppercase tracking-wider text-emerald-700">Approved</p>
                                            <CheckCircle2 className="size-4 text-emerald-600" />
                                        </div>
                                        <p className="mt-2 text-3xl font-bold text-emerald-800">{approvedCount}</p>
                                    </article>
                                    <article className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs uppercase tracking-wider text-rose-700">Rejected</p>
                                            <XCircle className="size-4 text-rose-600" />
                                        </div>
                                        <p className="mt-2 text-3xl font-bold text-rose-800">{rejectedCount}</p>
                                    </article>
                                </div>
                            </section>

                            <MovieContributionTableClient
                                contributions={contributions}
                                approveContributionAction={approveContributionAction}
                                rejectContributionAction={rejectContributionAction}
                            />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
