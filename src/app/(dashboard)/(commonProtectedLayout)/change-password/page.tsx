export default function ChangePasswordPage() {
    return (
        <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm text-slate-300">Security</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Change password</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                    This page is protected for all authenticated roles and works with the existing password-change enforcement in the proxy.
                </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm text-slate-300">Protected path</p>
                <p className="mt-2 text-xl font-semibold text-white">/change-password</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                    Users can reach this page from the protected dashboard navigation.
                </p>
            </div>
        </section>
    );
}