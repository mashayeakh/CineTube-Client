const genres = [
    "Action",
    "Drama",
    "Thriller",
    "Sci-Fi",
    "Romance",
    "Comedy",
    "Horror",
    "Documentary",
];

export default function GenreSpotlightSection() {
    return (
        <section className="py-16 bg-background text-foreground">
            <div className="container mx-auto px-4">
                <div className="mb-10 max-w-3xl">
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

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
                    {genres.map((genre) => (
                        <div
                            key={genre}
                            className="rounded-3xl border border-border bg-card p-5 text-center transition hover:-translate-y-1 hover:border-muted hover:bg-muted/20"
                        >
                            <p className="text-lg font-semibold text-foreground">{genre}</p>
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
