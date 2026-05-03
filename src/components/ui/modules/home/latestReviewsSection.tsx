import { MessageCircle, Star } from "lucide-react";

const reviews = [
    {
        author: "Ayesha",
        title: "A fantastic storytelling experience",
        excerpt: "The character arcs and pacing kept me engaged from start to finish.",
    },
    {
        author: "Rafi",
        title: "Visually stunning and emotionally rich",
        excerpt: "A must-watch for anyone who loves bold cinema.",
    },
    {
        author: "Mina",
        title: "A surprising gem",
        excerpt: "The performances and soundtrack were exceptional.",
    },
];

export default function LatestReviewsSection() {
    return (
        <section className="py-16 bg-background text-foreground">
            <div className="container mx-auto px-4">
                <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            Latest Reviews
                        </p>
                        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                            Fresh opinions from film lovers
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                            Read short reviews from the community to find your next favorite movie.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-3 rounded-full bg-muted px-4 py-2 text-sm text-foreground">
                        <MessageCircle className="size-5 text-foreground" />
                        3 recent reviews
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {reviews.map((review) => (
                        <article key={review.title} className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/40 text-foreground">
                                    <Star className="size-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">{review.author}</p>
                                    <p className="text-sm text-muted-foreground">Movie enthusiast</p>
                                </div>
                            </div>
                            <h3 className="mt-6 text-xl font-semibold">{review.title}</h3>
                            <p className="mt-4 text-sm leading-7 text-muted-foreground">{review.excerpt}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
