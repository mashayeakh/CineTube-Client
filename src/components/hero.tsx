import React from "react";
import { cn } from "@/lib/utils";

interface HeroProps {
  heading?: string;
  description?: string;
  button?: {
    text: string;
    url: string;
    className?: string;
  };
  reviews?: {
    count: number;
    rating?: number;
    avatars: {
      src: string;
      alt: string;
    }[];
  };
  className?: string;
}

const Hero = ({
  heading = "Explore Stories. Share Opinions. Discover What’s Worth Watching.",
  description = "Finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.",
  className,
}: HeroProps) => {
  return (
    <section
      className={cn(
        "relative overflow-hidden py-20 lg:py-28",
        "bg-[radial-gradient(circle_at_top,#173a63_0%,#0e223b_42%,#090f1d_100%)]",
        className
      )}
    >
      <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="container relative text-center">
        <div className="mx-auto mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-100">
          Now Streaming: Discover, rate, and review in one place
        </div>

        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-white lg:text-6xl">
            {heading}
          </h1>
          <p className="mx-auto max-w-3xl text-balance text-slate-200/90 lg:text-xl">{description}</p>
        </div>

        <div className="mx-auto mt-10 grid w-fit grid-cols-3 gap-3 rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur">
          <div className="rounded-xl bg-black/20 px-4 py-3">
            <p className="text-lg font-bold text-white">10k+</p>
            <p className="text-xs text-slate-300">Reviews</p>
          </div>
          <div className="rounded-xl bg-black/20 px-4 py-3">
            <p className="text-lg font-bold text-white">2k+</p>
            <p className="text-xs text-slate-300">Movies</p>
          </div>
          <div className="rounded-xl bg-black/20 px-4 py-3">
            <p className="text-lg font-bold text-white">24/7</p>
            <p className="text-xs text-slate-300">Community</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero };
