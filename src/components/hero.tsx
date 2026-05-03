import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface HeroProps {
  heading?: string;
  description?: string;
  className?: string;
}

const Hero = ({
  heading = "Explore Stories. Share Opinions. Discover What’s Worth Watching.",
  description = "Your ultimate destination to discover movies, write reviews, track your watchlist, and connect with a passionate community of film lovers.",
  className,
}: HeroProps) => {
  return (
    <section
      className={cn(
        "relative overflow-hidden min-h-[80vh] sm:min-h-[85vh] lg:min-h-[90vh] py-16 flex items-center justify-center",
        "bg-[radial-gradient(circle_at_top,#16375E_0%,#0e223b_42%,#090f1d_100%)]",
        className
      )}
    >
      <div className="pointer-events-none absolute -left-24 top-8 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-4 text-center">
        <div className="mx-auto mb-8 inline-flex items-center rounded-full border border-border bg-muted/70 px-4 py-2 text-xs font-semibold tracking-wide backdrop-blur-sm">
          <span className="mr-2 inline-block h-1 w-1.5 rounded-full bg-emerald-400" />
          Now Streaming: Discover, rate, and review in one place
        </div>

        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-white lg:text-6xl">
            {heading}
          </h1>
          <p className="mx-auto max-w-2xl text-balance text-base text-muted-foreground lg:text-lg">{description}</p>
        </div>

        {/* CTAs */}
        <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/movies/all-movies"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
          >
            Explore Movies
          </Link>
          <Link
            href="/series"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-muted px-7 text-sm font-semibold text-foreground transition hover:bg-muted/80"
          >
            Explore Series
          </Link>
          <Link
            href="/subscription"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-7 text-sm font-semibold text-background transition-all hover:bg-foreground/90"
          >
            Upgrade
          </Link>
        </div>

        <div className="mx-auto mt-10 grid w-fit grid-cols-3 gap-3 rounded-3xl border border-border bg-card/90 p-3 backdrop-blur-sm">
          <div className="rounded-3xl bg-muted/80 px-7 py-5 text-left shadow-sm border border-border">
            <p className="text-xl font-bold text-foreground">10k+</p>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Reviews</p>
          </div>
          <div className="rounded-3xl bg-muted/80 px-7 py-5 text-left shadow-sm border border-border">
            <p className="text-xl font-bold text-foreground">2k+</p>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Movies</p>
          </div>
          <div className="rounded-3xl bg-muted/80 px-7 py-5 text-left shadow-sm border border-border">
            <p className="text-xl font-bold text-foreground">24/7</p>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Community</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero };
