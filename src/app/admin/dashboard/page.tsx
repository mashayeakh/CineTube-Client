export default function AdminDashboardPage() {
    return (
        <section className="space-y-6 rounded-[28px] bg-slate-950/50 p-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">Admin dashboard</p>
                <h1 className="mt-3 text-3xl font-semibold">Administrative control panel</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                    Administrators are redirected here after authentication. Any route under /admin/dashboard is restricted to the ADMIN role.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-slate-300">Route owner</p>
                    <p className="mt-2 text-2xl font-semibold text-white">ADMIN</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-slate-300">Default path</p>
                    <p className="mt-2 text-2xl font-semibold text-white">/admin/dashboard</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-slate-300">Security model</p>
                    <p className="mt-2 text-2xl font-semibold text-white">Role-gated</p>
                </div>
            </div>
        </section>
    );
}