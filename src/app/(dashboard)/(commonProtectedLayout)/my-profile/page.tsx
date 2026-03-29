export default function MyProfilePage() {
    return (
        <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm text-slate-300">Profile</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">My profile</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                    This page is protected for any authenticated role through the common protected route configuration.
                </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm text-slate-300">Available to</p>
                <ul className="mt-3 space-y-2 text-sm text-white">
                    <li>USER</li>
                    <li>ADMIN</li>
                    <li>PREMIUM_USER</li>
                </ul>
            </div>
        </section>
    );
}