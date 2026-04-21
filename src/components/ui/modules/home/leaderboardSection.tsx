"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { FileText, Gem, Loader2, MessageSquare, ThumbsUp, Trophy, X, Sparkles, TrendingUp, Users, Star, Calendar, Film, Crown } from "lucide-react";

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
    return Math.min(100, Math.round((value / max) * 100));
}

type DummyProfileDetails = {
    bio: string;
    favoriteGenre: string;
    recentContributions: string[];
    activeDays: number;
    joinDate: string;
    impactScore: number;
};

const dummyGenres = ["Sci-Fi", "Thriller", "Drama", "Comedy", "Animation", "Documentary", "Horror", "Romance"];
const dummyQuotes = [
    "Passionate about accurate movie metadata",
    "Making CineTube better one edit at a time",
    "Community-driven quality assurance",
    "Helping users discover great content",
    "Dedicated to film preservation and accuracy"
];

function getDummyProfileDetails(row: LeaderboardUser): DummyProfileDetails {
    const safeRank = Math.max(1, row.rank);
    const genre = dummyGenres[(safeRank - 1) % dummyGenres.length];
    const quote = dummyQuotes[safeRank % dummyQuotes.length];

    return {
        bio: `${quote}. ${row.name} has been instrumental in improving content quality and metadata accuracy across the platform.`,
        favoriteGenre: genre,
        recentContributions: [
            "Verified cast and crew for top 2024 releases",
            "Added streaming platform availability",
            "Corrected release dates for 50+ titles",
            "Enhanced synopsis and descriptions",
            "Added content warnings and ratings"
        ],
        activeDays: 12 + (safeRank % 20),
        joinDate: `Joined ${Math.floor(Math.random() * 12) + 1} month${Math.random() > 0.5 ? 's' : ''} ago`,
        impactScore: 85 + (safeRank % 15)
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
        <section className="relative py-16 overflow-hidden">
            {/* Modern decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-100/30 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-sky-100/20 to-transparent rounded-full blur-3xl" />

            <div className="relative container mx-auto px-4">
                <div className="rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-100 shadow-2xl p-6 sm:p-8 lg:p-10">
                    {/* Header Section */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 px-4 py-1.5 shadow-sm">
                                <Trophy className="size-3.5 text-amber-600" />
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Leaderboard Glimpse</span>
                                <Sparkles className="size-3 text-amber-500" />
                            </div>
                            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-800">
                                Top Contributors
                                <span className="block text-lg font-medium text-slate-500 mt-1">Shaping the future of CineTube</span>
                            </h2>
                        </div>

                        <Link
                            href="/leaderboard"
                            className="group inline-flex items-center gap-2 rounded-full bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-slate-700 hover:shadow-xl hover:scale-105 active:scale-95"
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
                            <span className="text-slate-600 font-medium">Total Points</span>
                        </div>
                        <div className="inline-flex items-center gap-2">
                            <div className="h-2.5 w-8 rounded-full bg-gradient-to-r from-amber-400 to-rose-500" />
                            <span className="text-slate-600 font-medium">Engagement Points</span>
                        </div>
                        <div className="inline-flex items-center gap-2">
                            <div className="size-2 rounded-full bg-sky-400" />
                            <span className="text-slate-600">Click any card for details</span>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-12">
                            <Loader2 className="size-8 animate-spin text-slate-400" />
                            <p className="text-slate-500 font-medium">Loading top contributors...</p>
                        </div>
                    ) : null}

                    {/* Error State */}
                    {isError ? (
                        <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50/50 px-6 py-8 text-center backdrop-blur-sm">
                            <p className="text-rose-600 font-medium">Could not load leaderboard glimpse right now.</p>
                            <p className="text-rose-500 text-sm mt-1">Please try again later.</p>
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
                                        className="group relative cursor-pointer rounded-2xl border border-slate-100 bg-white p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-200"
                                        onClick={() => setSelectedUser(row)}
                                    >
                                        {/* Medal indicator for top 3 */}
                                        {isTop3 && (
                                            <div className="absolute -top-2 -right-2">
                                                {row.rank === 1 && <Trophy className="size-6 text-amber-500 fill-amber-500/20" />}
                                                {row.rank === 2 && <Trophy className="size-5 text-slate-400 fill-slate-400/20" />}
                                                {row.rank === 3 && <Trophy className="size-5 text-orange-500 fill-orange-500/20" />}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 opacity-0 transition-opacity group-hover:opacity-100 blur-md" />
                                                <Avatar className="relative size-14 border-2 border-white shadow-md">
                                                    <AvatarImage src={row.image ?? undefined} alt={row.name} />
                                                    <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-bold text-slate-700">
                                                        {getInitials(row.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h3 className="truncate text-lg font-bold text-slate-800 group-hover:text-slate-900">
                                                        {row.name}
                                                    </h3>
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                                                        #{row.rank}
                                                    </span>
                                                </div>
                                                <p className="truncate text-sm text-slate-500">{row.email.split('@')[0]}</p>
                                            </div>
                                        </div>

                                        {/* Progress Bars */}
                                        <div className="mt-4 space-y-3">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-slate-500 font-medium">Total Points</span>
                                                    <span className="font-bold text-slate-700">{row.points.toLocaleString()}</span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                                                        style={{ width: `${pointsProgress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-slate-500 font-medium">Engagement Points</span>
                                                    <span className="font-bold text-slate-700">{engagementPoints.toLocaleString()}</span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-500"
                                                        style={{ width: `${engagementProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
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
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-12 text-center md:col-span-2 lg:col-span-3">
                                    <Users className="size-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">No contributor data available yet.</p>
                                    <p className="text-slate-400 text-sm mt-1">Check back soon!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modern Modal/Drawer for User Details */}
            {selectedUser && selectedDummy && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md transition-all duration-300"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="leaderboard-user-detail-title"
                    onClick={() => setSelectedUser(null)}
                >
                    <div
                        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl transition-all duration-300 animate-in zoom-in-95"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {/* Decorative header gradient */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-amber-400/20 via-sky-400/10 to-transparent rounded-t-3xl pointer-events-none" />

                        <div className="relative p-6 sm:p-8">
                            {/* Close Button */}
                            <button
                                type="button"
                                onClick={() => setSelectedUser(null)}
                                className="absolute top-4 right-4 z-10 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 p-2 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 hover:scale-110"
                                aria-label="Close details"
                            >
                                <X className="size-4" />
                            </button>

                            {/* User Header */}
                            <div className="flex items-start gap-5">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-sky-400 opacity-75 blur-md" />
                                    <Avatar className="relative size-20 border-4 border-white shadow-xl">
                                        <AvatarImage src={selectedUser.image ?? undefined} alt={selectedUser.name} />
                                        <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-xl font-bold text-slate-700">
                                            {getInitials(selectedUser.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {selectedUser.rank === 1 && (
                                        <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 shadow-lg">
                                            <Crown className="size-3 text-white" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h3 id="leaderboard-user-detail-title" className="text-2xl font-black text-slate-800">
                                        {selectedUser.name}
                                    </h3>
                                    <p className="text-sm text-slate-500">{selectedUser.email}</p>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                                            Rank #{selectedUser.rank}
                                        </span>
                                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                                            {selectedUser.role}
                                        </span>
                                        <span className="rounded-full bg-amber-50 text-amber-700 px-2.5 py-0.5 text-xs font-semibold">
                                            Impact Score: {selectedDummy.impactScore}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="mt-6 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-100 px-5 py-4">
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {selectedDummy.bio}
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="group rounded-2xl border border-slate-100 bg-white p-3 transition-all hover:shadow-md">
                                    <FileText className="mb-2 size-5 text-emerald-500" />
                                    <p className="text-xs text-slate-500">Total Contributions</p>
                                    <p className="text-xl font-bold text-slate-800">
                                        {selectedUser.approvedContributions + selectedUser.pendingContributions + selectedUser.rejectedContributions}
                                    </p>
                                </div>
                                <div className="group rounded-2xl border border-slate-100 bg-white p-3 transition-all hover:shadow-md">
                                    <MessageSquare className="mb-2 size-5 text-sky-500" />
                                    <p className="text-xs text-slate-500">Comments Written</p>
                                    <p className="text-xl font-bold text-slate-800">{selectedUser.commentsWritten}</p>
                                </div>
                                <div className="group rounded-2xl border border-slate-100 bg-white p-3 transition-all hover:shadow-md">
                                    <ThumbsUp className="mb-2 size-5 text-rose-500" />
                                    <p className="text-xs text-slate-500">Likes Received</p>
                                    <p className="text-xl font-bold text-slate-800">{selectedUser.reviewLikesReceived}</p>
                                </div>
                                <div className="group rounded-2xl border border-slate-100 bg-white p-3 transition-all hover:shadow-md">
                                    <Gem className="mb-2 size-5 text-amber-500" />
                                    <p className="text-xs text-slate-500">Total Points</p>
                                    <p className="text-xl font-bold text-slate-800">{selectedUser.points.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl bg-slate-50/80 border border-slate-100 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Film className="size-4 text-slate-500" />
                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Favorite Genre</span>
                                    </div>
                                    <p className="mt-1 text-base font-semibold text-slate-800">{selectedDummy.favoriteGenre}</p>
                                    <p className="mt-1 text-xs text-slate-400">Based on contribution history</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50/80 border border-slate-100 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="size-4 text-slate-500" />
                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Activity</span>
                                    </div>
                                    <p className="mt-1 text-base font-semibold text-slate-800">{selectedDummy.activeDays} days active</p>
                                    <p className="mt-1 text-xs text-slate-400">{selectedDummy.joinDate}</p>
                                </div>
                            </div>

                            {/* Recent Contributions */}
                            <div className="mt-5 rounded-2xl bg-slate-50/80 border border-slate-100 px-5 py-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Star className="size-4 text-amber-500" />
                                    <p className="font-semibold text-slate-800">Recent Contributions</p>
                                </div>
                                <ul className="space-y-2">
                                    {selectedDummy.recentContributions.slice(0, 4).map((item) => (
                                        <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
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