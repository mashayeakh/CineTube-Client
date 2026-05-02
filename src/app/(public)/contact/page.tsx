import Link from "next/link"

export default function ContactPage() {
    return (
        <main className="relative bg-gradient-to-b from-[#0d0d1f] via-[#0d1a2f] to-[#0d253f] text-white min-h-screen overflow-hidden">
            {/* Decorative gradient blurs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-l from-indigo-500/20 to-violet-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
                <div className="mb-16 space-y-6 text-center">
                    <div className="inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">
                        Contact
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
                        We're here to help.
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-300">
                        Reach out about account questions, partnerships, feedback, or inquiries.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">Get in touch</h2>
                            <p className="text-slate-300 leading-8">
                                Our team monitors requests daily. Use the channels below for the fastest response.
                            </p>
                        </div>

                        <dl className="mt-8 space-y-6 text-slate-300">
                            <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-6">
                                <dt className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-300">Email</dt>
                                <dd className="mt-3 text-xl font-bold text-white">support@cinetube.app</dd>
                                <dd className="mt-2 text-sm text-slate-400">Reply within 24 hours.</dd>
                            </div>
                            <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-6">
                                <dt className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-300">Help center</dt>
                                <dd className="mt-3 text-xl font-bold text-white">FAQ & support</dd>
                                <dd className="mt-2 text-sm text-slate-400">Fast route for common questions.</dd>
                            </div>
                            <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-6">
                                <dt className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-300">Partnerships</dt>
                                <dd className="mt-3 text-xl font-bold text-white">partner@cinetube.app</dd>
                                <dd className="mt-2 text-sm text-slate-400">For collaborations and integrations.</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">Quick links</h2>
                            <p className="text-slate-300 leading-8">
                                Explore answers, report issues, or share feedback.
                            </p>
                        </div>

                        <ul className="mt-8 space-y-4">
                            <li className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-5">
                                <p className="font-bold text-white">Help center</p>
                                <p className="mt-2 text-slate-400">Browse common questions.</p>
                                <Link href="/help" className="mt-4 inline-flex rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:from-indigo-500 hover:to-violet-500">
                                    Visit FAQ
                                </Link>
                            </li>
                            <li className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-5">
                                <p className="font-bold text-white">Blog</p>
                                <p className="mt-2 text-slate-400">Read insights and guides.</p>
                                <Link href="/blog" className="mt-4 inline-flex rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:from-indigo-500 hover:to-violet-500">
                                    Explore
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl text-slate-300">
                    <h2 className="text-3xl font-bold text-white">Ready to connect?</h2>
                    <p className="mt-3 max-w-2xl leading-8">
                        Email our team and we'll get you a helpful answer fast.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4">
                        <Link href="mailto:support@cinetube.app" className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white transition hover:from-indigo-500 hover:to-violet-500">
                            Email support
                        </Link>
                        <Link href="/privacy-policy" className="inline-flex items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/5 px-6 py-3 text-sm font-bold text-indigo-300 transition hover:border-indigo-500/50 hover:bg-indigo-500/10">
                            Privacy policy
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
