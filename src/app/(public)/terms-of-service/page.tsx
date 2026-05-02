export default function TermsOfServicePage() {
    return (
        <main className="relative bg-gradient-to-b from-[#0d0d1f] via-[#0d1a2f] to-[#0d253f] text-white min-h-screen overflow-hidden">
            {/* Decorative gradient blurs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-1/3 w-96 h-96 bg-gradient-to-l from-indigo-500/20 to-violet-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-4xl px-6 py-16 sm:px-8 lg:px-12">
                <div className="mb-16 space-y-6 text-center">
                    <div className="inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">
                        Terms of Service
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight sm:text-6xl bg-linear-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
                        Terms governing CineTube.
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-300">
                        These terms describe how you may use the site, your responsibilities, and our rights.
                    </p>
                </div>

                <div className="space-y-6 rounded-2xl border border-white/10 bg-white/3 p-8 backdrop-blur-xl shadow-2xl">
                    <section className="space-y-4">
                        <h2 className="text-3xl font-bold">Acceptance of terms</h2>
                        <p className="text-slate-300 leading-8">
                            By using CineTube, you agree to these terms and any policies published on our site.
                        </p>
                    </section>

                    <hr className="border-white/10" />

                    <section className="space-y-4">
                        <h2 className="text-3xl font-bold">User conduct</h2>
                        <p className="text-slate-300 leading-8">
                            Users must use CineTube responsibly and not attempt to access restricted areas or bypass security measures.
                        </p>
                    </section>

                    <hr className="border-white/10" />

                    <section className="space-y-4">
                        <h2 className="text-3xl font-bold">Content use</h2>
                        <p className="text-slate-300 leading-8">
                            Content on CineTube is for personal viewing and discovery only. Reproduction or redistribution requires permission.
                        </p>
                    </section>

                    <hr className="border-white/10" />

                    <section className="space-y-4">
                        <h2 className="text-3xl font-bold">Privacy</h2>
                        <p className="text-slate-300 leading-8">
                            Your use of the site is governed by our Privacy Policy, which explains how we handle your data.
                        </p>
                    </section>

                    <hr className="border-white/10" />

                    <section className="space-y-4">
                        <h2 className="text-3xl font-bold">Changes to terms</h2>
                        <p className="text-slate-300 leading-8">
                            CineTube may update these terms anytime. Continued use after changes means you accept the updated terms.
                        </p>
                    </section>

                    <hr className="border-white/10" />

                    <section className="space-y-4">
                        <h2 className="text-3xl font-bold">Limitation of liability</h2>
                        <p className="text-slate-300 leading-8">
                            CineTube is provided as-is. We're not liable for indirect or consequential damages from your use of the service.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    )
}
