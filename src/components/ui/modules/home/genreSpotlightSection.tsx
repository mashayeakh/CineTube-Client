import { getGenres } from "@/app/(public)/public/_actions/genres";

export default async function GenreSpotlightSection() {
    const genres = await getGenres();

    return (
        <section className="py-16 bg-background text-foreground overflow-hidden">
            <div className="container mx-auto px-4 mb-10">
                <div className="max-w-3xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                        Genre Spotlight
                    </p>
                    <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                        Explore movies by mood and style
                    </h2>
                    <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                        Browse curated genre picks designed to help you find the perfect watch for every moment.
                    </p>
                </div>
            </div>

            <div className="relative flex w-full overflow-hidden group">
                <div className="flex w-max min-w-full shrink-0 animate-marquee items-center gap-4 px-2 group-hover:[animation-play-state:paused]">
                    {genres.map((genre: any) => (
                        <div
                            key={genre._id || genre.id || genre.name}
                            className="min-w-[200px] shrink-0 rounded-3xl border border-border bg-card p-5 text-center transition hover:-translate-y-1 hover:border-muted hover:bg-muted/20"
                        >
                            <p className="text-lg font-semibold text-foreground">{genre.name || genre.title}</p>
                            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                curated picks
                            </p>
                        </div>
                    ))}
                </div>
                <div className="flex w-max min-w-full shrink-0 animate-marquee items-center gap-4 px-2 group-hover:[animation-play-state:paused]" aria-hidden="true">
                    {genres.map((genre: any) => (
                        <div
                            key={`dup-${genre._id || genre.id || genre.name}`}
                            className="min-w-[200px] shrink-0 rounded-3xl border border-border bg-card p-5 text-center transition hover:-translate-y-1 hover:border-muted hover:bg-muted/20"
                        >
                            <p className="text-lg font-semibold text-foreground">{genre.name || genre.title}</p>
                            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                curated picks
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
