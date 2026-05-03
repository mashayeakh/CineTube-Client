import Link from "next/link";
import { Star, Heart } from "lucide-react";

const topRatedMovies = [
    {
        title: "Skyline Echoes",
        genre: "Drama",
        rating: "9.4",
        note: "Critics choice with emotional depth.",
    },
    {
        title: "Midnight Run",
        genre: "Action",
        rating: "9.2",
        note: "A fast-paced thriller with sharp visuals.",
    },
    {
        title: "Moonlit Sonata",
        genre: "Romance",
        rating: "9.0",
        note: "A moving story of love and redemption.",
    },
    {
        title: "Neon City",
        genre: "Sci-Fi",
        rating: "8.9",
        note: "Bold worldbuilding and unforgettable characters.",
    },
];

export default function TopRatedSection() {
    return (
        <section className="py-16 bg-background text-foreground">
            <div className="container mx-auto px-4">
                <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            Top Rated
                        </p>
                        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                            The highest rated titles right now
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                            Discover the most acclaimed films in our library, chosen by movie fans and critics alike.
                        </p>
                    </div>
                    <Link
                        href="/movies/top-rated"
                        className="inline-flex items-center rounded-full border border-border bg-muted px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/80"
                    >
                        Browse top rated
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {topRatedMovies.map((movie) => (
                        <div key={movie.title} className="rounded-[2rem] border border-border bg-card p-6 shadow-2xl shadow-black/5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-semibold">{movie.title}</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">{movie.genre}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-muted/40 text-foreground">
                                    <Star className="size-5" />
                                </div>
                            </div>
                            <p className="mt-5 text-sm leading-6 text-muted-foreground">{movie.note}</p>
                            <div className="mt-6 flex items-center justify-between">
                                <span className="rounded-full bg-muted px-3 py-1 text-sm text-foreground">
                                    {movie.rating}
                                </span>
                                <button className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/80">
                                    <Heart className="size-4" />
                                    Favorite
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
