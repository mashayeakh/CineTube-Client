export default function HelpPage() {
    return (
        <main className="relative bg-gradient-to-b from-[#0d0d1f] via-[#0d1a2f] to-[#0d253f] text-white min-h-screen overflow-hidden">
            {/* Decorative gradient blurs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-l from-indigo-500/20 to-violet-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
                <div className="mb-16 space-y-6 text-center">
                    <div className="inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">
                        Help & FAQ
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight sm:text-6xl bg-linear-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
                        Answers to your questions.
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-300">
                        Find quick answers for account setup, content discovery, and billing.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
                    <div className="space-y-6">
                        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">
                            <h2 className="text-3xl font-bold">Account & membership</h2>
                            <div className="mt-8 space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold">How do I sign up?</h3>
                                    <p className="mt-3 text-slate-300 leading-7">Click Sign Up, complete the form, and confirm your email to start using CineTube.</p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Can I manage my subscription?</h3>
                                    <p className="mt-3 text-slate-300 leading-7">Yes. Visit your account dashboard to view billing and update your plan.</p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">How do I reset my password?</h3>
                                    <p className="mt-3 text-slate-300 leading-7">Use the password reset link on the login page, or contact support for help.</p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">
                            <h2 className="text-3xl font-bold">Browsing & discovery</h2>
                            <div className="mt-8 space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold">How do I find the latest movies?</h3>
                                    <p className="mt-3 text-slate-300 leading-7">Use Popular and Trending sections, or navigate to Movies and TV pages.</p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">What info is provided for titles?</h3>
                                    <p className="mt-3 text-slate-300 leading-7">Each page includes summaries, cast, ratings, reviews, and recommendations.</p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">
                            <h2 className="text-3xl font-bold">Support & troubleshooting</h2>
                            <div className="mt-8 space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold">I can't log in</h3>
                                    <p className="mt-3 text-slate-300 leading-7">Reset your password on the login page, or contact support if you need help.</p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">How do I report a problem?</h3>
                                    <p className="mt-3 text-slate-300 leading-7">Email support@cinetube.app with details about the issue and your device info.</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="rounded-2xl border border-white/10 bg-white/3 p-8 backdrop-blur-xl shadow-2xl h-fit">
                        <h2 className="text-3xl font-bold text-white">Quick links</h2>
                        <ul className="mt-6 space-y-4 text-slate-300 text-sm leading-7">
                            <li className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-2">Account setup</li>
                            <li className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-2">Subscription options</li>
                            <li className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-2">Discovery tips</li>
                            <li className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-2">Email support</li>
                        </ul>
                        <div className="mt-6 rounded-lg border border-indigo-500/20 bg-linear-to-br from-indigo-500/5 to-violet-500/5 p-4">
                            <p className="font-bold text-white">Need more help?</p>
                            <p className="mt-2 text-slate-400 text-sm">Contact our team for quick responses.</p>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    )
}
