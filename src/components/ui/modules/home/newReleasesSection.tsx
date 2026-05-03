import Link from "next/link";

const newReleases = [
    {
        title: "Hidden Harbor",
        meta: "Mystery • 2026",
        description: "A suspenseful thriller with a stunning coastal setting.",
    },
    {
        title: "Aurora Drift",
        meta: "Sci-Fi • 2026",
        description: "A futuristic adventure about hope, loss, and discovery.",
    },
    {
        title: "City Echo",
        meta: "Drama • 2026",
        description: "An intimate portrait of urban lives and the stories that connect them.",
    },
];

export default function NewReleasesSection() {
    return (
        <section className="py-16 bg-background text-foreground">
            <div className="container mx-auto px-4">
                <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            New Releases
                        </p>
                        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                            Fresh movies added this week
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                            Check out the latest arrivals and stay ahead of the new cinematic wave.
                        </p>
                    </div>
                    <Link
                        href="/movies/all-movies"
                        className="inline-flex items-center rounded-full border border-border bg-muted px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/80"
                    >
                        See all releases
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {newReleases.map((release) => (
                        <div key={release.title} className="rounded-[2rem] border border-border bg-card p-7 shadow-sm">
                            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold uppercase text-foreground">
                                New
                            </span>
                            <h3 className="mt-6 text-2xl font-semibold">{release.title}</h3>
                            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">{release.meta}</p>
                            <p className="mt-4 text-sm leading-7 text-muted-foreground">{release.description}</p>
                            <div className="mt-6">
                                <Link
                                    href="/movies/all-movies"
                                    className="text-sm font-semibold text-foreground transition hover:text-muted-foreground"
                                >
                                    Watch now →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
