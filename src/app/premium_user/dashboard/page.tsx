export default function PremiumUserDashboardPage() {
    return (
        <section className="space-y-6 rounded-[28px] bg-slate-950/50 p-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300">Premium dashboard</p>
                <h1 className="mt-3 text-3xl font-semibold">Premium member hub</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                    Premium users are directed here automatically after login. Any route under /premium_user/dashboard is protected for the PREMIUM_USER role.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-slate-300">Route owner</p>
                    <p className="mt-2 text-2xl font-semibold text-white">PREMIUM_USER</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-slate-300">Default path</p>
                    <p className="mt-2 text-2xl font-semibold text-white">/premium_user/dashboard</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-slate-300">Membership access</p>
                    <p className="mt-2 text-2xl font-semibold text-white">Premium only</p>
                </div>
            </div>
        </section>
    );
}