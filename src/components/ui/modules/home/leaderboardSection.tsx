"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { FileText, Gem, Loader2, MessageSquare, ThumbsUp, Trophy, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getLeaderboard, type LeaderboardUser } from "@/service/leaderboard.services";

function getInitials(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function getEngagementPoints(row: LeaderboardUser) {
    return (
        row.pointsBreakdown.reviewPoints +
        row.pointsBreakdown.commentPoints +
        row.pointsBreakdown.likeReceivedPoints
    );
}

function getProgress(value: number, max: number) {
    if (max <= 0) return 0;
    return Math.max(6, Math.round((value / max) * 100));
}

type DummyProfileDetails = {
    bio: string;
    favoriteGenre: string;
    recentContributions: string[];
    activeDays: number;
};

const dummyGenres = ["Sci-Fi", "Thriller", "Drama", "Comedy", "Animation", "Documentary"];

function getDummyProfileDetails(row: LeaderboardUser): DummyProfileDetails {
    const safeRank = Math.max(1, row.rank);
    const genre = dummyGenres[(safeRank - 1) % dummyGenres.length];

    return {
        bio: `${row.name} is actively helping improve CineTube metadata and community quality.`,
        favoriteGenre: genre,
        recentContributions: [
            "Updated cast and crew information",
            "Added streaming availability notes",
            "Fixed release year and language metadata",
        ],
        activeDays: 7 + safeRank,
    };
}

export default function LeaderboardSection() {
    const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["leaderboard-glimpse"],
        queryFn: getLeaderboard,
    });

    const rows = useMemo(
        () => [...(data?.rows ?? [])].sort((a, b) => a.rank - b.rank).slice(0, 6),
        [data?.rows]
    );

    const maxPoints = useMemo(
        () => rows.reduce((highest, row) => Math.max(highest, row.points), 0),
        [rows]
    );

    const maxEngagement = useMemo(
        () => rows.reduce((highest, row) => Math.max(highest, getEngagementPoints(row)), 0),
        [rows]
    );

    const selectedDummy = selectedUser ? getDummyProfileDetails(selectedUser) : null;

    return (
        <section className="bg-linear-to-b from-background to-muted/10 py-16">
            <div className="container mx-auto px-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                                <Trophy className="size-3.5 text-amber-500" />
                                Leaderboard Glimpse
                            </div>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Top Contributors</h2>
                            <p className="mt-2 text-sm text-slate-600 sm:text-base">
                                Quick snapshot of who is shaping the platform right now.
                            </p>
                        </div>

                        <Link
                            href="/leaderboard"
                            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            <Gem className="size-4 text-sky-300" />
                            View Full Leaderboard
                        </Link>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-slate-600">
                        <div className="inline-flex items-center gap-2">
                            <span className="size-2 rounded-full bg-emerald-400" />
                            Total Points
                        </div>
                        <div className="inline-flex items-center gap-2">
                            <span className="size-2 rounded-full bg-rose-400" />
                            Engagement Points
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="mt-8 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-600">
                            <Loader2 className="size-4 animate-spin" />
                            Loading leaderboard glimpse...
                        </div>
                    ) : null}

                    {isError ? (
                        <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-rose-600">
                            Could not load leaderboard glimpse right now.
                        </div>
                    ) : null}

                    {!isLoading && !isError ? (
                        <div className="mt-8 grid gap-4 lg:grid-cols-2">
                            {rows.map((row) => {
                                const engagementPoints = getEngagementPoints(row);
                                const pointsProgress = getProgress(row.points, maxPoints);
                                const engagementProgress = getProgress(engagementPoints, maxEngagement);

                                return (
                                    <article
                                        key={row.userId}
                                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100/70"
                                    >
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedUser(row)}
                                                className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 text-left transition hover:bg-white"
                                            >
                                                <Avatar className="size-12 border border-slate-200 bg-white">
                                                    <AvatarImage src={row.image ?? undefined} alt={row.name} />
                                                    <AvatarFallback className="bg-slate-100 text-sm font-semibold text-slate-700">
                                                        {getInitials(row.name)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <h3 className="truncate text-xl font-semibold text-slate-900 group-hover:underline">{row.name}</h3>
                                                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                            #{row.rank}
                                                        </span>
                                                    </div>
                                                    <p className="truncate text-sm text-slate-500">{row.email}</p>
                                                </div>
                                            </button>

                                            <div className="hidden text-xs text-slate-400 sm:block">Click profile</div>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                                                    <div
                                                        className="h-full rounded-full bg-linear-to-r from-emerald-300 to-emerald-500"
                                                        style={{ width: `${pointsProgress}%` }}
                                                    />
                                                </div>
                                                <span className="text-lg font-semibold text-slate-900">{row.points.toLocaleString()}</span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                                                    <div
                                                        className="h-full rounded-full bg-linear-to-r from-amber-300 to-rose-500"
                                                        style={{ width: `${engagementProgress}%` }}
                                                    />
                                                </div>
                                                <span className="text-lg font-semibold text-slate-900">{engagementPoints.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}

                            {rows.length === 0 ? (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-slate-600 lg:col-span-2">
                                    No contributor data available yet.
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>

            {selectedUser && selectedDummy ? (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="leaderboard-user-detail-title"
                    onClick={() => setSelectedUser(null)}
                >
                    <div
                        className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_35px_90px_rgba(15,23,42,0.25)] sm:p-8"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="size-16 border border-slate-200 bg-slate-100">
                                    <AvatarImage src={selectedUser.image ?? undefined} alt={selectedUser.name} />
                                    <AvatarFallback className="bg-slate-100 text-base font-semibold text-slate-700">
                                        {getInitials(selectedUser.name)}
                                    </AvatarFallback>
                                </Avatar>

                                <div>
                                    <h3 id="leaderboard-user-detail-title" className="text-2xl font-semibold text-slate-900">
                                        {selectedUser.name}
                                    </h3>
                                    <p className="text-sm text-slate-500">{selectedUser.email}</p>
                                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                        Rank #{selectedUser.rank} • {selectedUser.role}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedUser(null)}
                                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Close details"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            {selectedDummy.bio}
                        </p>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                <FileText className="mb-1 size-4 text-slate-500" />
                                Contributions:{" "}
                                <span className="font-semibold text-slate-900">
                                    {selectedUser.approvedContributions + selectedUser.pendingContributions + selectedUser.rejectedContributions}
                                </span>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                <MessageSquare className="mb-1 size-4 text-slate-500" />
                                Comments: <span className="font-semibold text-slate-900">{selectedUser.commentsWritten}</span>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                <ThumbsUp className="mb-1 size-4 text-slate-500" />
                                Likes Received: <span className="font-semibold text-slate-900">{selectedUser.reviewLikesReceived}</span>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                <Gem className="mb-1 size-4 text-sky-500" />
                                Points: <span className="font-semibold text-slate-900">{selectedUser.points}</span>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                                Favorite Genre: <span className="font-semibold text-slate-900">{selectedDummy.favoriteGenre}</span>
                                <p className="mt-1 text-xs text-slate-500">Dummy preview data</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                                Active Days (last month): <span className="font-semibold text-slate-900">{selectedDummy.activeDays}</span>
                                <p className="mt-1 text-xs text-slate-500">Dummy preview data</p>
                            </div>
                        </div>

                        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            <p className="font-semibold text-slate-900">Recent Contributions (Dummy)</p>
                            <ul className="mt-2 space-y-1">
                                {selectedDummy.recentContributions.map((item) => (
                                    <li key={item} className="text-slate-600">• {item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
