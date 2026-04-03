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
        "relative overflow-hidden py-24 lg:py-32",
        "bg-[radial-gradient(circle_at_top,#173a63_0%,#0e223b_42%,#090f1d_100%)]",
        className
      )}
    >
      <div className="pointer-events-none absolute -left-24 top-8 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative text-center">
        <div className="mx-auto mb-8 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-100 backdrop-blur-sm">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
          Now Streaming: Discover, rate, and review in one place
        </div>

        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-white lg:text-6xl">
            {heading}
          </h1>
          <p className="mx-auto max-w-2xl text-balance text-base text-slate-300 lg:text-lg">{description}</p>
        </div>

        {/* CTAs */}
        <div className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/popular"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-slate-900 shadow-lg transition-all hover:bg-white/90"
          >
            Explore Movies
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
          >
            Sign Up Free
          </Link>
        </div>

        <div className="mx-auto mt-14 grid w-fit grid-cols-3 gap-3 rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur">
          <div className="rounded-xl bg-black/20 px-6 py-4">
            <p className="text-xl font-bold text-white">10k+</p>
            <p className="text-xs text-slate-400">Reviews</p>
          </div>
          <div className="rounded-xl bg-black/20 px-6 py-4">
            <p className="text-xl font-bold text-white">2k+</p>
            <p className="text-xs text-slate-400">Movies</p>
          </div>
          <div className="rounded-xl bg-black/20 px-6 py-4">
            <p className="text-xl font-bold text-white">24/7</p>
            <p className="text-xs text-slate-400">Community</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero };
