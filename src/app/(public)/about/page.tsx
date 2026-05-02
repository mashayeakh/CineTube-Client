import Link from "next/link"

export default function AboutPage() {
    return (
        <main className="relative bg-gradient-to-b from-[#0d0d1f] via-[#0d1a2f] to-[#0d253f] text-white min-h-screen overflow-hidden">
            {/* Decorative gradient blurs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-l from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
                <div className="mb-16 space-y-6 text-center">
                    <div className="inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">
                        About CineTube
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight sm:text-6xl bg-linear-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
                        Your trusted film discovery hub.
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-300">
                        Premium content, editorial curation, and community recommendations in one polished experience.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
                    <div className="space-y-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold">Our mission</h2>
                            <p className="text-slate-300 leading-8">
                                We help fans find the very best movies and series, whether they want something new, trending, or perfectly matched to their mood.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-6">
                                <h3 className="text-lg font-bold">Curated recommendations</h3>
                                <p className="mt-3 text-slate-400 leading-7">
                                    From blockbuster hits to hidden gems, our editorial picks help you discover with confidence.
                                </p>
                            </div>
                            <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-6">
                                <h3 className="text-lg font-bold">Modern design</h3>
                                <p className="mt-3 text-slate-400 leading-7">
                                    Clean typography, strong contrast, and clear navigation throughout.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold">Why CineTube?</h2>
                            <p className="text-slate-300 leading-8">
                                Data-driven recommendations and a friendly interface so you spend less time searching.
                            </p>
                        </div>
                        <ul className="space-y-4 text-slate-300">
                            <li className="flex items-start gap-3">
                                <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-bold text-white">1</span>
                                <div>
                                    <p className="font-bold text-white">Fast discovery</p>
                                    <p className="mt-1 text-slate-400">Navigate with speed and clarity.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-bold text-white">2</span>
                                <div>
                                    <p className="font-bold text-white">Reliable information</p>
                                    <p className="mt-1 text-slate-400">Accurate details and honest reviews.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-bold text-white">3</span>
                                <div>
                                    <p className="font-bold text-white">Built for film lovers</p>
                                    <p className="mt-1 text-slate-400">Every choice feels worthwhile.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    )
}
