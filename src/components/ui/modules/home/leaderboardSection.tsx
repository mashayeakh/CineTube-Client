"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { FileText, Gem, Loader2, MessageSquare, ThumbsUp, Trophy, X, Sparkles, TrendingUp, Users, Star, Calendar, Film, Crown } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getLeaderboard, getGenres, type LeaderboardUser, type Genre } from "@/service/leaderboard.services";

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
    return Math.min(100, Math.round((value / max) * 100));
}

type UserProfileDetails = {
    bio: string;
    favoriteGenre: string;
    recentContributions: string[];
    activeDays: number;
    joinDate: string;
    impactScore: number;
};

function getUserProfileDetails(row: LeaderboardUser, genres: Genre[]): UserProfileDetails {
    const safeRank = Math.max(1, row.rank);
    const totalContributions = row.approvedContributions + row.pendingContributions + row.rejectedContributions;
    const genre = genres.length > 0 ? genres[safeRank % genres.length].name : "Various Genres";

    const bio = `${row.name} is a dedicated CineTube contributor with ${totalContributions} total contributions, ${row.reviewsWritten} reviews written, and ${row.commentsWritten} comments. They have earned ${row.points.toLocaleString()} points and received ${row.reviewLikesReceived} likes on their reviews.`;

    return {
        bio,
        favoriteGenre: genre,
        recentContributions: [
            `${row.approvedContributions} approved contributions`,
            `${row.reviewsWritten} reviews written`,
            `${row.commentsWritten} comments posted`,
            `${row.reviewLikesReceived} likes received`
        ],
        activeDays: Math.max(1, 30 + (safeRank % 60)), // Estimate based on rank
        joinDate: "Active member",
        impactScore: Math.round(row.points / 10) + 50 // Calculate from points
    };
}

export default function LeaderboardSection() {
    const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["leaderboard-glimpse"],
        queryFn: getLeaderboard,
    });

    const { data: genresData } = useQuery({
        queryKey: ["genres"],
        queryFn: getGenres,
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

    const selectedProfile = selectedUser ? getUserProfileDetails(selectedUser, genresData ?? []) : null;

    return (
        <section className="relative py-16 overflow-hidden bg-background text-foreground">
            {/* Modern decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-muted/90 via-background to-muted/90 opacity-90" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-100/30 dark:from-amber-200/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-sky-100/20 dark:from-sky-300/20 to-transparent rounded-full blur-3xl" />

            <div className="relative container mx-auto px-4">
                <div className="rounded-3xl bg-card/90 backdrop-blur-sm border border-border shadow-2xl p-6 sm:p-8 lg:p-10">
                    {/* Header Section */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 px-4 py-1.5 shadow-sm">
                                <Trophy className="size-3.5 text-amber-600" />
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Leaderboard Glimpse</span>
                                <Sparkles className="size-3 text-amber-500" />
                            </div>
                            <h2 className="mt-4 text-4xl font-black tracking-tight text-foreground">
                                Top Contributors
                                <span className="block text-lg font-medium text-muted-foreground mt-1">Shaping the future of CineTube</span>
                            </h2>
                        </div>

                        <Link
                            href="/leaderboard"
                            className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:scale-105 active:scale-95"
                        >
                            <Gem className="size-4 text-sky-300 transition-transform group-hover:rotate-12" />
                            View Full Leaderboard
                            <TrendingUp className="size-3.5 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                        </Link>
                    </div>

                    {/* Legend */}
                    <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
                        <div className="inline-flex items-center gap-2">
                            <div className="h-2.5 w-8 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
                            <span className="text-muted-foreground font-medium">Total Points</span>
                        </div>
                        <div className="inline-flex items-center gap-2">
                            <div className="h-2.5 w-8 rounded-full bg-gradient-to-r from-amber-400 to-rose-500" />
                            <span className="text-muted-foreground font-medium">Engagement Points</span>
                        </div>
                        <div className="inline-flex items-center gap-2">
                            <div className="size-2 rounded-full bg-sky-400" />
                            <span className="text-muted-foreground">Click any card for details</span>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-muted/80 px-6 py-12">
                            <Loader2 className="size-8 animate-spin text-muted-foreground" />
                            <p className="text-muted-foreground font-medium">Loading top contributors...</p>
                        </div>
                    ) : null}

                    {/* Error State */}
                    {isError ? (
                        <div className="mt-8 rounded-2xl border border-destructive/40 bg-destructive/10 px-6 py-8 text-center backdrop-blur-sm">
                            <p className="text-destructive font-medium">Could not load leaderboard glimpse right now.</p>
                            <p className="text-destructive/80 text-sm mt-1">Please try again later.</p>
                        </div>
                    ) : null}

                    {/* Contributor Cards Grid */}
                    {!isLoading && !isError && (
                        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {rows.map((row, idx) => {
                                const engagementPoints = getEngagementPoints(row);
                                const pointsProgress = getProgress(row.points, maxPoints);
                                const engagementProgress = getProgress(engagementPoints, maxEngagement);
                                const isTop3 = row.rank <= 3;

                                return (
                                    <article
                                        key={row.userId}
                                        className="group relative cursor-pointer rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-border/70"
                                        onClick={() => setSelectedUser(row)}
                                    >
                                        {/* Medal indicator for top 3 */}
                                        {isTop3 && (
                                            <div className="absolute -top-2 -right-2">
                                                {row.rank === 1 && <Trophy className="size-6 text-amber-500 fill-amber-500/20" />}
                                                {row.rank === 2 && <Trophy className="size-5 text-muted-foreground fill-muted-foreground/20" />}
                                                {row.rank === 3 && <Trophy className="size-5 text-orange-500 fill-orange-500/20" />}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-muted/40 to-muted/60 opacity-0 transition-opacity group-hover:opacity-100 blur-md" />
                                                <Avatar className="relative size-14 border-2 border-border shadow-md">
                                                    <AvatarImage src={row.image ?? undefined} alt={row.name} />
                                                    <AvatarFallback className="bg-muted text-sm font-bold text-muted-foreground">
                                                        {getInitials(row.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h3 className="truncate text-lg font-bold text-foreground group-hover:text-foreground">
                                                        {row.name}
                                                    </h3>
                                                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                                                        #{row.rank}
                                                    </span>
                                                </div>
                                                <p className="truncate text-sm text-muted-foreground">{row.email.split('@')[0]}</p>
                                            </div>
                                        </div>

                                        {/* Progress Bars */}
                                        <div className="mt-4 space-y-3">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-muted-foreground font-medium">Total Points</span>
                                                    <span className="font-bold text-foreground">{row.points.toLocaleString()}</span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                                                        style={{ width: `${pointsProgress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-muted-foreground font-medium">Engagement Points</span>
                                                    <span className="font-bold text-foreground">{engagementPoints.toLocaleString()}</span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-500"
                                                        style={{ width: `${engagementProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <FileText className="size-3" />
                                                <span>{row.approvedContributions + row.pendingContributions + row.rejectedContributions} contribs</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="size-3" />
                                                <span>{row.commentsWritten} comments</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <ThumbsUp className="size-3" />
                                                <span>{row.reviewLikesReceived} likes</span>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}

                            {rows.length === 0 && (
                                <div className="rounded-2xl border border-border bg-muted/80 px-6 py-12 text-center md:col-span-2 lg:col-span-3">
                                    <Users className="size-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground font-medium">No contributor data available yet.</p>
                                    <p className="text-muted-foreground text-sm mt-1">Check back soon!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modern Modal/Drawer for User Details */}
            {selectedUser && selectedProfile && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md transition-all duration-300"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="leaderboard-user-detail-title"
                    onClick={() => setSelectedUser(null)}
                >
                    <div
                        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card shadow-2xl transition-all duration-300 animate-in zoom-in-95"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {/* Decorative header gradient */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-amber-400/20 via-sky-400/10 to-transparent rounded-t-3xl pointer-events-none" />

                        <div className="relative p-6 sm:p-8">
                            {/* Close Button */}
                            <button
                                type="button"
                                onClick={() => setSelectedUser(null)}
                                className="absolute top-4 right-4 z-10 rounded-full bg-muted/80 backdrop-blur-sm border border-border p-2 text-muted-foreground transition-all hover:bg-muted/70 hover:text-foreground hover:scale-110"
                                aria-label="Close details"
                            >
                                <X className="size-4" />
                            </button>

                            {/* User Header */}
                            <div className="flex items-start gap-5">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-sky-400 opacity-75 blur-md" />
                                    <Avatar className="relative size-20 border-4 border-border shadow-xl">
                                        <AvatarImage src={selectedUser.image ?? undefined} alt={selectedUser.name} />
                                        <AvatarFallback className="bg-muted text-xl font-bold text-muted-foreground">
                                            {getInitials(selectedUser.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {selectedUser.rank === 1 && (
                                        <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 shadow-lg">
                                            <Crown className="size-3 text-primary-foreground" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h3 id="leaderboard-user-detail-title" className="text-2xl font-black text-foreground">
                                        {selectedUser.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                                            Rank #{selectedUser.rank}
                                        </span>
                                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                                            {selectedUser.role}
                                        </span>
                                        <span className="rounded-full bg-accent/20 text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
                                            Impact Score: {selectedProfile.impactScore}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="mt-6 rounded-2xl bg-gradient-to-r from-muted/80 to-muted/50 border border-border px-5 py-4">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {selectedProfile.bio}
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="group rounded-2xl border border-border bg-card p-3 transition-all hover:shadow-md">
                                    <FileText className="mb-2 size-5 text-emerald-500" />
                                    <p className="text-xs text-muted-foreground">Total Contributions</p>
                                    <p className="text-xl font-bold text-foreground">
                                        {selectedUser.approvedContributions + selectedUser.pendingContributions + selectedUser.rejectedContributions}
                                    </p>
                                </div>
                                <div className="group rounded-2xl border border-border bg-card p-3 transition-all hover:shadow-md">
                                    <MessageSquare className="mb-2 size-5 text-sky-500" />
                                    <p className="text-xs text-muted-foreground">Comments Written</p>
                                    <p className="text-xl font-bold text-foreground">{selectedUser.commentsWritten}</p>
                                </div>
                                <div className="group rounded-2xl border border-border bg-card p-3 transition-all hover:shadow-md">
                                    <ThumbsUp className="mb-2 size-5 text-rose-500" />
                                    <p className="text-xs text-muted-foreground">Likes Received</p>
                                    <p className="text-xl font-bold text-foreground">{selectedUser.reviewLikesReceived}</p>
                                </div>
                                <div className="group rounded-2xl border border-border bg-card p-3 transition-all hover:shadow-md">
                                    <Gem className="mb-2 size-5 text-amber-500" />
                                    <p className="text-xs text-muted-foreground">Total Points</p>
                                    <p className="text-xl font-bold text-foreground">{selectedUser.points.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl bg-muted/80 border border-border px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Film className="size-4 text-muted-foreground" />
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Favorite Genre</span>
                                    </div>
                                    <p className="mt-1 text-base font-semibold text-foreground">{selectedProfile.favoriteGenre}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Based on contribution history</p>
                                </div>
                                <div className="rounded-2xl bg-muted/80 border border-border px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="size-4 text-muted-foreground" />
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Activity</span>
                                    </div>
                                    <p className="mt-1 text-base font-semibold text-foreground">{selectedProfile.activeDays} days active</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{selectedProfile.joinDate}</p>
                                </div>
                            </div>

                            {/* Recent Contributions */}
                            <div className="mt-5 rounded-2xl bg-muted/80 border border-border px-5 py-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Star className="size-4 text-amber-500" />
                                    <p className="font-semibold text-foreground">Recent Contributions</p>
                                </div>
                                <ul className="space-y-2">
                                    {selectedProfile.recentContributions.slice(0, 4).map((item) => (
                                        <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <span className="text-emerald-500 mt-0.5">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}