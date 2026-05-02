export default function PrivacyPolicyPage() {
    return (
        <main className="relative bg-gradient-to-b from-[#0d0d1f] via-[#0d1a2f] to-[#0d253f] text-white min-h-screen overflow-hidden">
            {/* Decorative gradient blurs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-l from-violet-500/10 to-indigo-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-4xl px-6 py-16 sm:px-8 lg:px-12">
                <div className="mb-16 space-y-6 text-center">
                    <div className="inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">
                        Privacy Policy
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight sm:text-6xl bg-linear-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
                        We protect your data.
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-300">
                        This policy explains how we collect, use, and protect your information.
                    </p>
                </div>

                <div className="space-y-6 rounded-2xl border border-white/10 bg-white/3 p-8 backdrop-blur-xl shadow-2xl">
                    <section className="space-y-4">
                        <h2 className="text-3xl font-bold">Information we collect</h2>
                        <p className="text-slate-300 leading-8">
                            We collect information you provide when creating an account, your preferences, and basic usage data to improve your experience.
                        </p>
                    </section>

                    <hr className="border-white/10" />

                    <section className="space-y-4">
                        <h2 className="text-3xl font-bold">How we use your information</h2>
                        <p className="text-slate-300 leading-8">
                            Your information helps us personalize recommendations, respond to support, and deliver a more relevant experience.
                        </p>
                    </section>

                    <hr className="border-white/10" />

                    <section className="space-y-4">
                        <h2 className="text-3xl font-bold">Cookies and tracking</h2>
                        <p className="text-slate-300 leading-8">
                            We use cookies to remember preferences, analyze performance, and maintain secure sessions.
                        </p>
                    </section>

                    <hr className="border-white/10" />

                    <section className="space-y-4">
                        <h2 className="text-3xl font-bold">Data security</h2>
                        <p className="text-slate-300 leading-8">
                            We follow industry best practices to protect your information from unauthorized access and misuse.
                        </p>
                    </section>

                    <hr className="border-white/10" />

                    <section className="space-y-4">
                        <h2 className="text-3xl font-bold">Your choices</h2>
                        <p className="text-slate-300 leading-8">
                            You can manage preferences, update your profile, or request account deletion by contacting support.
                        </p>
                    </section>

                    <hr className="border-white/10" />

                    <section className="space-y-4">
                        <h2 className="text-3xl font-bold">Contact us</h2>
                        <p className="text-slate-300 leading-8">
                            If you have questions about this policy or your data, email support@cinetube.app.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    )
}
