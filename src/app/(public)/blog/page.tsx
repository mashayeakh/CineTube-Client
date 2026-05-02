import Link from "next/link"

export default function BlogPage() {
    return (
        <main className="relative bg-gradient-to-b from-[#0d0d1f] via-[#0d1a2f] to-[#0d253f] text-white min-h-screen overflow-hidden">
            {/* Decorative gradient blurs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/3 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-l from-violet-500/10 to-indigo-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
                <div className="mb-16 space-y-6 text-center">
                    <div className="inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">
                        Blog
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight sm:text-6xl bg-linear-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
                        Stories and viewing guides.
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-300">
                        Featured editorials, trend reports, and how-to guides for the best streaming choices.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-300">Featured</span>
                        <h2 className="mt-4 text-2xl font-bold">Top movies this season</h2>
                        <p className="mt-4 text-slate-300 leading-7">
                            Standout films, handpicked for drama, action, and unforgettable stories.
                        </p>
                        <Link href="#top" className="mt-6 inline-flex rounded-lg bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:from-indigo-500 hover:to-violet-500">
                            Read article
                        </Link>
                    </article>

                    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-300">Insight</span>
                        <h2 className="mt-4 text-2xl font-bold">Build your watchlist</h2>
                        <p className="mt-4 text-slate-300 leading-7">
                            Tips for organizing movies, series, and favorites across genres.
                        </p>
                        <Link href="#watchlist" className="mt-6 inline-flex rounded-lg bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:from-indigo-500 hover:to-violet-500">
                            Learn more
                        </Link>
                    </article>

                    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-300">Culture</span>
                        <h2 className="mt-4 text-2xl font-bold">Streaming trends</h2>
                        <p className="mt-4 text-slate-300 leading-7">
                            Explore what audiences are talking about and find the shows with buzz.
                        </p>
                        <Link href="#trending" className="mt-6 inline-flex rounded-lg bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:from-indigo-500 hover:to-violet-500">
                            Explore now
                        </Link>
                    </article>
                </div>

                <div className="mt-16 rounded-2xl border border-white/10 bg-white/3 p-8 backdrop-blur-xl shadow-2xl">
                    <h2 className="text-3xl font-bold">Latest posts</h2>
                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                        <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-6">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Editorial</p>
                            <h3 className="mt-3 text-xl font-bold">New wave of sci-fi</h3>
                            <p className="mt-3 text-slate-400 leading-7">The most compelling science fiction shows defining the year.</p>
                        </div>
                        <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-6">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Guides</p>
                            <h3 className="mt-3 text-xl font-bold">Maximize CineTube</h3>
                            <p className="mt-3 text-slate-400 leading-7">Tips for faster discovery and organizing your watchlist.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
