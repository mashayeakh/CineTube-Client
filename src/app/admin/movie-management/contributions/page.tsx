import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Bell, Home, Search } from "lucide-react";

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
    const contributions = normalizeContributions(rawContributions);

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/movie-management/contributions" />

                <div className="min-w-0">
                    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Movie Management</p>
                            <p className="text-xs text-slate-500">Contributions handler</p>
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
                                <p className="text-sm text-slate-500">Admin / Movie Management / Contributions</p>
                                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Movie Contribution Handler</h1>
                                <p className="mt-2 text-sm text-slate-600">Review who contributed movies, then approve or reject each contribution.</p>
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
