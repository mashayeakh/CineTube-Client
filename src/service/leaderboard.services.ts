export interface LeaderboardUser {
    rank: number;
    userId: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    approvedContributions: number;
    pendingContributions: number;
    rejectedContributions: number;
    reviewsWritten: number;
    commentsWritten: number;
    reviewLikesReceived: number;
    points: number;
    pointsBreakdown: {
        approvedContributionPoints: number;
        pendingContributionPoints: number;
        rejectedContributionPoints: number;
        reviewPoints: number;
        commentPoints: number;
        likeReceivedPoints: number;
    };
}

interface LeaderboardEnvelope {
    success?: boolean;
    message?: string;
    result?: LeaderboardUser[];
    data?: LeaderboardUser[];
}

export interface LeaderboardResponse {
    rows: LeaderboardUser[];
    message: string;
}

export async function getLeaderboard(): Promise<LeaderboardResponse> {
    const response = await fetch("/api/leaderboard", {
        method: "GET",
        cache: "no-store",
    });

    const payload = (await response.json().catch(() => ({}))) as LeaderboardEnvelope;

    if (!response.ok) {
        throw new Error(payload.message ?? "Failed to fetch leaderboard.");
    }

    return {
        rows: payload.result ?? payload.data ?? [],
        message: payload.message ?? "Leaderboard fetched successfully",
    };
}
