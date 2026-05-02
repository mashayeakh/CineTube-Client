/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Crown, Gem, Loader2, Trophy, TrendingUp, Users, Sparkles, ArrowLeft } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getLeaderboard, type LeaderboardUser } from "@/service/leaderboard.services";

type PodiumAccent = "gold" | "silver" | "bronze";

const podiumAccents: PodiumAccent[] = ["gold", "silver", "bronze"];

const podiumAccentStyles: Record<PodiumAccent, string> = {
    gold: "bg-amber-50 text-amber-700 border-amber-200",
    silver: "bg-slate-50 text-slate-600 border-slate-200",
    bronze: "bg-orange-50 text-orange-700 border-orange-200",
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
        <article className={cn("flex flex-col items-center relative group", emphasized ? "lg:-mb-4" : "lg:pt-12")}>
            {/* Floating trophy crown for rank one */}
            {emphasized && (
                <>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 animate-bounce-slow">
                        <div className="relative">
                            <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-50 animate-pulse" />
                            <Trophy className="size-14 text-amber-500 drop-shadow-2xl fill-amber-500/20" strokeWidth={1.5} />
                        </div>
                    </div>
                    {/* Glow effect behind avatar */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl" />
                </>
            )}

            {/* Avatar with modern ring effect */}
            <div className="relative">
                <div className={cn(
                    "absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                    emphasized ? "bg-linear-to-r from-amber-400 to-amber-600 blur-xl" : "bg-linear-to-r from-slate-400 to-slate-600 blur-lg"
                )} />
                <Avatar
                    className={cn(
                        "relative border-2 transition-all duration-500 group-hover:scale-105",
                        emphasized
                            ? "size-32 sm:size-36 border-amber-400 shadow-2xl ring-4 ring-amber-400/30"
                            : "size-24 sm:size-28 border-white shadow-xl",
                        "bg-white"
                    )}
                >
                    <AvatarImage src={user.image ?? undefined} alt={user.name} />
                    <AvatarFallback className={cn(
                        "text-lg font-bold",
                        emphasized ? "bg-linear-to-br from-amber-100 to-amber-200 text-amber-800" : "bg-linear-to-br from-slate-100 to-slate-200 text-slate-700"
                    )}>
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>
                {emphasized && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-0.5 rounded-full shadow-lg">
                        #1
                    </div>
                )}
            </div>

            <h3 className={cn("mt-6 text-center font-bold tracking-tight", emphasized ? "text-3xl text-slate-800" : "text-2xl text-slate-700")}>
                {user.name}
            </h3>

            {/* Modern glassmorphism card */}
            <div
                className={cn(
                    "mt-6 w-full max-w-88 rounded-3xl backdrop-blur-sm transition-all duration-500 group-hover:translate-y-[-4px]",
                    emphasized ? "bg-white/95 shadow-2xl border border-amber-100" : "bg-white/90 shadow-xl border border-slate-100",
                    "px-6 pb-8 pt-6"
                )}
            >
                <div className={cn("mx-auto flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur-sm border", podiumAccentStyles[accent])}>
                    <Trophy className="size-4" />
                    Rank #{user.rank}
                </div>

                <p className="mt-5 text-center text-sm text-slate-500">
                    <span className="font-bold text-slate-800 text-base">{user.approvedContributions}</span> approved contributions
                </p>

                <div className="mx-auto mt-5 h-px w-full max-w-56 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                <div className="mt-5 flex items-center justify-center gap-2">
                    <Gem className="size-8 fill-sky-500 text-sky-500" />
                    <span className="text-3xl font-black tracking-tight text-slate-800">{user.points.toLocaleString()}</span>
                </div>
                <p className="mt-1 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Total Points</p>

                <div className="mt-6 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-slate-50/80 px-3 py-2 text-center">
                        <p className="text-[10px] font-medium text-slate-400 uppercase">Pending</p>
                        <p className="text-sm font-bold text-slate-700">{user.pendingContributions}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50/80 px-3 py-2 text-center">
                        <p className="text-[10px] font-medium text-slate-400 uppercase">Rejected</p>
                        <p className="text-sm font-bold text-slate-700">{user.rejectedContributions}</p>
                    </div>
                </div>

                {emphasized ? (
                    <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                        <Crown className="size-4 fill-white" />
                        Champion
                        <Sparkles className="size-3" />
                    </div>
                ) : null}
            </div>
        </article>
    );
}

function MetricCard({ label, value, icon: Icon, trend }: { label: string; value: number; icon: any; trend?: number }) {
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-4 transition-all duration-300 hover:shadow-xl hover:border-slate-200">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-slate-50 to-transparent rounded-full blur-2xl" />
            <div className="relative flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
                    <p className="mt-1 text-2xl font-black text-slate-800">{value.toLocaleString()}</p>
                    {trend !== undefined && (
                        <div className="mt-1 flex items-center gap-1">
                            <TrendingUp className={cn("size-3", trend >= 0 ? "text-emerald-500" : "text-red-500")} />
                            <span className={cn("text-xs font-medium", trend >= 0 ? "text-emerald-600" : "text-red-600")}>
                                {trend > 0 ? `+${trend}` : trend}%
                            </span>
                        </div>
                    )}
                </div>
                <div className="rounded-full bg-slate-50 p-2">
                    <Icon className="size-5 text-slate-400" />
                </div>
            </div>
        </div>
    );
}

export function LeaderboardShowcase() {
    const router = useRouter();
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
        <section className="relative mx-auto max-w-300 overflow-hidden bg-white px-4 py-12 sm:px-6 lg:px-10">
            {/* Back Button */}
            <button
                onClick={() => router.push("/")}
                className="absolute top-6 left-6 z-50 flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md hover:scale-105 active:scale-95"
            >
                <ArrowLeft className="size-4" />
                Back to Home
            </button>

            {/* Modern decorative elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-transparent to-transparent opacity-70" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-slate-100/50 rounded-full blur-3xl" />

            <div className="relative">
                {/* Header with modern badge */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 shadow-lg">
                        <Sparkles className="size-4 text-amber-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Live Rankings</span>
                    </div>
                    <h2 className="mt-6 text-4xl font-black tracking-tight text-slate-800 sm:text-5xl">
                        Leaderboard
                    </h2>
                    <p className="mt-3 text-slate-500">Top contributors driving the community forward</p>
                </div>

                {/* Modern metrics grid */}
                <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <MetricCard label="Total Users" value={rows.length} icon={Users} />
                    <MetricCard label="Total Points" value={summary.totalPoints} icon={Gem} trend={12} />
                    <MetricCard label="Approved" value={summary.approved} icon={Trophy} trend={8} />
                    <MetricCard label="Reviews" value={summary.reviews} icon={TrendingUp} trend={5} />
                    <MetricCard label="Comments" value={summary.comments} icon={Sparkles} trend={3} />
                    <MetricCard label="Likes" value={summary.likes} icon={Crown} trend={15} />
                </div>

                {isLoading ? (
                    <div className="mt-14 flex flex-col items-center justify-center gap-4 rounded-3xl bg-slate-50/50 px-6 py-16">
                        <Loader2 className="size-8 animate-spin text-slate-400" />
                        <p className="text-slate-500 font-medium">Loading leaderboard data...</p>
                    </div>
                ) : null}

                {isError ? (
                    <div className="mt-14 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
                        <p className="text-rose-600 font-medium">{errorMessage}</p>
                    </div>
                ) : null}

                {!isLoading && !isError ? (
                    <>
                        {/* Podium Section */}
                        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_1.2fr_1fr] lg:items-end">
                            {podiumRows.map((user, index) => (
                                <PodiumCard
                                    key={user.userId}
                                    user={user}
                                    accent={podiumAccents[index]}
                                    emphasized={user.rank === 1}
                                />
                            ))}
                        </div>

                        {/* Modern table with clean design */}
                        <div className="mt-16 rounded-2xl border border-slate-100 bg-white shadow-xl overflow-hidden">
                            <div className="hidden grid-cols-[70px_minmax(240px,1.5fr)_1fr_1fr_100px] gap-4 bg-slate-50/80 px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 md:grid">
                                <span>Rank</span>
                                <span>Contributor</span>
                                <span>Role</span>
                                <span>Activity</span>
                                <span className="text-right">Points</span>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {rows.map((row, idx) => (
                                    <div key={row.userId} className="group px-4 py-4 transition-all hover:bg-slate-50/50 md:px-6">
                                        <div className="grid gap-4 md:grid-cols-[70px_minmax(240px,1.5fr)_1fr_1fr_100px] md:items-center">
                                            {/* Rank with medal for top 3 */}
                                            <div className="flex items-center gap-2">
                                                {row.rank === 1 && <Trophy className="size-5 text-amber-500" />}
                                                {row.rank === 2 && <Trophy className="size-5 text-slate-400" />}
                                                {row.rank === 3 && <Trophy className="size-5 text-orange-500" />}
                                                <span className={cn(
                                                    "text-lg font-bold",
                                                    row.rank === 1 ? "text-amber-600" : row.rank === 2 ? "text-slate-500" : row.rank === 3 ? "text-orange-600" : "text-slate-700"
                                                )}>
                                                    #{row.rank}
                                                </span>
                                            </div>

                                            {/* User info */}
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-10 border border-slate-200 shadow-sm">
                                                    <AvatarImage src={row.image ?? undefined} alt={row.name} />
                                                    <AvatarFallback className="bg-slate-100 text-xs font-bold text-slate-600">
                                                        {getInitials(row.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-slate-800">{row.name}</p>
                                                    <p className="text-xs text-slate-400">{row.email.split('@')[0]}</p>
                                                </div>
                                            </div>

                                            {/* Role badge */}
                                            <div>
                                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                                    {row.role}
                                                </span>
                                            </div>

                                            {/* Activity count */}
                                            <div>
                                                <span className="font-semibold text-slate-700">
                                                    {row.approvedContributions + row.pendingContributions + row.rejectedContributions}
                                                </span>
                                                <span className="text-xs text-slate-400 ml-1">total</span>
                                            </div>

                                            {/* Points */}
                                            <div className="flex justify-end">
                                                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 font-bold text-slate-800">
                                                    <Gem className="size-3.5 fill-sky-500 text-sky-500" />
                                                    {row.points.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Collapsible details on hover/click (modern touch) */}
                                        <div className="mt-3 grid grid-cols-3 gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100 md:grid-cols-6">
                                            <div className="text-center">
                                                <p className="text-[10px] font-medium text-slate-400">Approved</p>
                                                <p className="text-sm font-semibold text-slate-700">{row.approvedContributions}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-medium text-slate-400">Pending</p>
                                                <p className="text-sm font-semibold text-slate-700">{row.pendingContributions}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-medium text-slate-400">Reviews</p>
                                                <p className="text-sm font-semibold text-slate-700">{row.reviewsWritten}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-medium text-slate-400">Comments</p>
                                                <p className="text-sm font-semibold text-slate-700">{row.commentsWritten}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-medium text-slate-400">Likes</p>
                                                <p className="text-sm font-semibold text-slate-700">{row.reviewLikesReceived}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-medium text-slate-400">Rejected</p>
                                                <p className="text-sm font-semibold text-slate-700">{row.rejectedContributions}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {rows.length === 0 ? (
                                    <div className="px-6 py-16 text-center">
                                        <p className="text-slate-400">No contributors found</p>
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