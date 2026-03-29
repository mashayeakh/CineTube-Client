export default function UserDashboardPage() {
    return (
        <section className="space-y-6 rounded-[28px] bg-slate-950/50 p-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">User dashboard</p>
                <h1 className="mt-3 text-3xl font-semibold">Welcome to your user workspace</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                    Signed-in users land here automatically after login. Any route under /user/dashboard is now protected for the USER role.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-slate-300">Route owner</p>
                    <p className="mt-2 text-2xl font-semibold text-white">USER</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-slate-300">Default path</p>
                    <p className="mt-2 text-2xl font-semibold text-white">/user/dashboard</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-slate-300">Shared account pages</p>
                    <p className="mt-2 text-2xl font-semibold text-white">2 routes</p>
                </div>
            </div>
        </section>
    );
}