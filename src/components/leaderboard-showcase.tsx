"use client";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { Crown, Gem, Loader2, Trophy } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getLeaderboard, type LeaderboardUser } from "@/service/leaderboard.services";

type PodiumAccent = "gold" | "silver" | "bronze";

const podiumAccents: PodiumAccent[] = ["gold", "silver", "bronze"];

const podiumAccentStyles: Record<PodiumAccent, string> = {
    gold: "bg-[#ffe8a3] text-[#8a6200] border-[#f2cc62]",
    silver: "bg-[#eef1f6] text-[#576171] border-[#d1d9e6]",
    bronze: "bg-[#fde4cd] text-[#925c22] border-[#efbe8d]",
};

function getInitials(name: string) {
    return name
        .split(" ")
        .map((segment) => segment[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function sanitizeRows(rows: LeaderboardUser[]) {
    return [...rows].sort((a, b) => a.rank - b.rank);
}

function createPodiumRows(rows: LeaderboardUser[]) {
    const firstThree = sanitizeRows(rows).slice(0, 3);
    const [rank1, rank2, rank3] = [firstThree[0], firstThree[1], firstThree[2]];
    return [rank2, rank1, rank3].filter((entry): entry is LeaderboardUser => Boolean(entry));
}

function formatSigned(value: number) {
    if (value > 0) {
        return `+${value}`;
    }

    return `${value}`;
}

function PodiumCard({
    user,
    accent,
    emphasized,
}: {
    user: LeaderboardUser;
    accent: PodiumAccent;
    emphasized?: boolean;
}) {
    return (
        <article className={cn("flex flex-col items-center", emphasized ? "lg:-mb-2" : "lg:pt-10")}>
            <Avatar
                className={cn(
                    "border border-slate-200 bg-slate-100 shadow-[0_16px_40px_rgba(15,23,42,0.12)]",
                    emphasized ? "size-24 sm:size-28" : "size-20 sm:size-24"
                )}
            >
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback className="bg-slate-100 text-base font-semibold text-slate-700">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>

            <h3 className={cn("mt-4 text-center font-semibold text-slate-900", emphasized ? "text-3xl" : "text-2xl")}>
                {user.name}
            </h3>

            <div
                className={cn(
                    "mt-5 w-full max-w-88 rounded-t-[2rem] border border-slate-200 border-b-0 bg-linear-to-b from-white to-slate-50 px-6 pb-8 pt-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]",
                    emphasized ? "min-h-80 sm:min-h-88" : "min-h-66 sm:min-h-72"
                )}
            >
                <div className={cn("mx-auto flex w-fit items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold", podiumAccentStyles[accent])}>
                    <Trophy className="size-4" />
                    Rank {user.rank}
                </div>

                <p className="mt-4 text-center text-base text-slate-600">Approved {user.approvedContributions} contributions</p>
                <div className="mx-auto mt-5 h-px w-full max-w-56 bg-slate-200" />

                <div className="mt-5 flex items-center justify-center gap-2 text-[2rem] font-semibold tracking-tight text-slate-900">
                    <Gem className="size-7 fill-[#2d95dd] text-[#2d95dd]" />
                    <span>{user.points.toLocaleString()}</span>
                </div>
                <p className="mt-1 text-center text-lg text-slate-600">Points</p>

                <div className="mt-6 grid grid-cols-2 gap-2 text-left text-xs text-slate-600">
                    <div className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                        Pending: <span className="font-semibold text-slate-800">{user.pendingContributions}</span>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                        Rejected: <span className="font-semibold text-slate-800">{user.rejectedContributions}</span>
                    </div>
                </div>

                {emphasized ? (
                    <div className="mt-10 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                        <Crown className="size-4 text-amber-300" />
                        Top Contributor
                    </div>
                ) : null}
            </div>
        </article>
    );
}

export function LeaderboardShowcase() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["leaderboard"],
        queryFn: getLeaderboard,
    });

    const rows = useMemo(() => sanitizeRows(data?.rows ?? []), [data?.rows]);
    const podiumRows = useMemo(() => createPodiumRows(rows), [rows]);
    const summary = useMemo(
        () =>
            rows.reduce(
                (acc, row) => ({
                    totalPoints: acc.totalPoints + row.points,
                    approved: acc.approved + row.approvedContributions,
                    pending: acc.pending + row.pendingContributions,
                    rejected: acc.rejected + row.rejectedContributions,
                    reviews: acc.reviews + row.reviewsWritten,
                    comments: acc.comments + row.commentsWritten,
                    likes: acc.likes + row.reviewLikesReceived,
                }),
                {
                    totalPoints: 0,
                    approved: 0,
                    pending: 0,
                    rejected: 0,
                    reviews: 0,
                    comments: 0,
                    likes: 0,
                }
            ),
        [rows]
    );

    const errorMessage = error instanceof Error ? error.message : "Failed to load leaderboard.";

    return (
        <section className="relative isolate mx-auto max-w-300 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white px-4 py-8 text-slate-900 shadow-[0_36px_100px_rgba(15,23,42,0.08)] sm:px-6 sm:py-10 lg:px-10 lg:py-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.05),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]" />

            <div className="relative">
                <div className="mx-auto flex w-fit items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
                    <span className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-600">Live Leaderboard</span>
                </div>

                <div className="mx-auto mt-6 flex w-fit flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-600 sm:text-base">
                    <span>Total users</span>
                    <span className="font-semibold text-slate-900">{rows.length}</span>
                    <span>with</span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
                        <Gem className="size-4 fill-[#2d95dd] text-[#2d95dd]" />
                        {summary.totalPoints.toLocaleString()} points
                    </span>
                </div>

                <div className="mx-auto mt-4 grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm text-slate-600">
                        Approved <p className="text-base font-semibold text-slate-900">{summary.approved}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm text-slate-600">
                        Pending <p className="text-base font-semibold text-slate-900">{summary.pending}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm text-slate-600">
                        Rejected <p className="text-base font-semibold text-slate-900">{summary.rejected}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm text-slate-600">
                        Reviews <p className="text-base font-semibold text-slate-900">{summary.reviews}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm text-slate-600">
                        Comments <p className="text-base font-semibold text-slate-900">{summary.comments}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm text-slate-600">
                        Likes <p className="text-base font-semibold text-slate-900">{summary.likes}</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="mt-14 flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-8 text-slate-600">
                        <Loader2 className="size-5 animate-spin" />
                        Loading leaderboard...
                    </div>
                ) : null}

                {isError ? (
                    <div className="mt-14 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-6 text-center text-rose-600">
                        {errorMessage}
                    </div>
                ) : null}

                {!isLoading && !isError ? (
                    <>
                        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.16fr_1fr] lg:items-end">
                            {podiumRows.map((user, index) => (
                                <PodiumCard
                                    key={user.userId}
                                    user={user}
                                    accent={podiumAccents[index]}
                                    emphasized={user.rank === 1}
                                />
                            ))}
                        </div>

                        <div className="mt-12 rounded-[2rem] border border-slate-200 bg-white px-3 py-4 shadow-[0_22px_60px_rgba(15,23,42,0.08)] sm:px-4 sm:py-5">
                            <div className="hidden grid-cols-[88px_minmax(220px,2fr)_1fr_1fr_130px] gap-4 px-5 pb-4 text-sm text-slate-500 md:grid">
                                <span>Rank</span>
                                <span>User name</span>
                                <span>Role</span>
                                <span>Activity</span>
                                <span className="text-right">Points</span>
                            </div>

                            <div className="space-y-3">
                                {rows.map((row) => (
                                    <div
                                        key={row.userId}
                                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 md:px-5"
                                    >
                                        <div className="grid gap-4 md:grid-cols-[88px_minmax(220px,2fr)_1fr_1fr_130px] md:items-center">
                                            <div className="flex items-center justify-between md:block">
                                                <span className="text-xs uppercase tracking-[0.22em] text-slate-400 md:hidden">Rank</span>
                                                <span className="text-xl font-semibold text-slate-900">{row.rank}</span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-11 border border-slate-200 bg-white">
                                                    <AvatarImage src={row.image ?? undefined} alt={row.name} />
                                                    <AvatarFallback className="bg-slate-100 text-sm font-semibold text-slate-700">
                                                        {getInitials(row.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-base font-medium text-slate-900">{row.name}</p>
                                                    <p className="text-sm text-slate-500">{row.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:block">
                                                <span className="text-xs uppercase tracking-[0.22em] text-slate-400 md:hidden">Role</span>
                                                <span className="text-base font-medium text-slate-700">{row.role}</span>
                                            </div>

                                            <div className="flex items-center justify-between md:block">
                                                <span className="text-xs uppercase tracking-[0.22em] text-slate-400 md:hidden">Activity</span>
                                                <span className="text-base font-medium text-slate-900">
                                                    {row.approvedContributions + row.pendingContributions + row.rejectedContributions}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end">
                                                <span className="text-xs uppercase tracking-[0.22em] text-slate-400 md:hidden">Points</span>
                                                <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-900">
                                                    <Gem className="size-4 fill-[#2d95dd] text-[#2d95dd]" />
                                                    {row.points}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                                Approved: <span className="font-semibold text-slate-900">{row.approvedContributions}</span>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                                Pending: <span className="font-semibold text-slate-900">{row.pendingContributions}</span>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                                Rejected: <span className="font-semibold text-slate-900">{row.rejectedContributions}</span>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                                Reviews: <span className="font-semibold text-slate-900">{row.reviewsWritten}</span>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                                Comments: <span className="font-semibold text-slate-900">{row.commentsWritten}</span>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                                Likes received: <span className="font-semibold text-slate-900">{row.reviewLikesReceived}</span>
                                            </div>
                                        </div>

                                        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                                Approved points: <span className="font-semibold text-slate-900">{formatSigned(row.pointsBreakdown.approvedContributionPoints)}</span>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                                Pending points: <span className="font-semibold text-slate-900">{formatSigned(row.pointsBreakdown.pendingContributionPoints)}</span>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                                Rejected points: <span className="font-semibold text-slate-900">{formatSigned(row.pointsBreakdown.rejectedContributionPoints)}</span>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                                Review points: <span className="font-semibold text-slate-900">{formatSigned(row.pointsBreakdown.reviewPoints)}</span>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                                Comment points: <span className="font-semibold text-slate-900">{formatSigned(row.pointsBreakdown.commentPoints)}</span>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                                Like points: <span className="font-semibold text-slate-900">{formatSigned(row.pointsBreakdown.likeReceivedPoints)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {rows.length === 0 ? (
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-7 text-center text-slate-600">
                                        No leaderboard data available.
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </section>
    );
}