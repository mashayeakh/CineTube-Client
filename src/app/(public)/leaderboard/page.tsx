import { LeaderboardShowcase } from "@/components/leaderboard-showcase";

export default function LeaderboardPage() {
    return (
        <main className="min-h-[calc(100vh-5rem)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
            <LeaderboardShowcase />
        </main>
    );
}