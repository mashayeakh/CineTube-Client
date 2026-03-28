import Link from "next/link";
import { Home, Film, Clapperboard, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-linear-to-b from-background via-background to-muted/30">
            <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

            <section className="container mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-16 text-center">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
                    <Film className="size-4 text-primary" />
                    Scene Not Found
                </div>

                <h1 className="mb-2 bg-linear-to-r from-foreground via-foreground/80 to-foreground/50 bg-clip-text text-7xl font-black text-transparent sm:text-8xl md:text-9xl">
                    404
                </h1>

                <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                    This page is not in the reel
                </h2>

                <p className="mb-8 max-w-2xl text-base text-muted-foreground sm:text-lg">
                    The link might be broken, removed, or the route does not exist yet. Let&apos;s take you back to valid CineTube pages.
                </p>

                <div className="mb-10 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Tip 1</p>
                        <p className="mt-1 text-sm font-medium">Check the URL spelling</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Tip 2</p>
                        <p className="mt-1 text-sm font-medium">Open Popular movies</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Tip 3</p>
                        <p className="mt-1 text-sm font-medium">Start again from Home</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/"
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
                    >
                        <Home className="mr-2 size-4" />
                        Go Home
                    </Link>
                    <Link
                        href="/movie/popular"
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-7 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <Clapperboard className="mr-2 size-4" />
                        Browse Popular Movies
                    </Link>
                </div>

                <Link
                    href="/"
                    className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back to safety
                </Link>

                <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
                    <Search className="size-3.5" />
                    Try searching a movie from the home page
                </div>
            </section>
        </main>
    );
}