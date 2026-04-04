import { Leaderboard } from "@/components/leaderboard";

export default function LeaderboardPage() {
    return (
        <main className="min-h-[calc(100vh-7rem)] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-12">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">More</p>
                    <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Leaderboard</h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                        Track top contributors, standout activity, and the people helping build the CineTube catalog.
                    </p>
                </section>

                <Leaderboard />
            </div>
        </main>
    );
}