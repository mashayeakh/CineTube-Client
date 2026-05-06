"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Star, Heart, ArrowRight, Award } from "lucide-react";
import { getTopRatedMovies } from "@/app/(public)/public/_actions/movie";
import { Skeleton } from "@/components/ui/skeleton";

export default function TopRatedSection() {
    const { data: movies, isLoading, error } = useQuery({
        queryKey: ["top-rated-movies"],
        queryFn: getTopRatedMovies,
    });

    if (isLoading) {
        return (
            <section className="py-20 bg-background/50" id="trending">
                <div className="container mx-auto px-4">
                    <div className="mb-12">
                        <Skeleton className="h-4 w-32 mb-4" />
                        <Skeleton className="h-10 w-64 mb-4" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-[22rem] w-full rounded-[2.5rem]" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error || !movies) {
        return null; // Silent fail or simple error message
    }

    const topMovies = movies.slice(0, 4);

    return (
        <section className="py-24 bg-background text-foreground" id="trending">
            <div className="container mx-auto px-4">
                <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Award className="size-4 text-primary animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
                                Top Rated
                            </p>
                        </div>
                        <h2 className="text-4xl font-black text-foreground tracking-tight sm:text-5xl">
                            The highest rated titles right now
                        </h2>
                        <p className="mt-4 max-w-2xl text-sm text-muted-foreground font-medium leading-relaxed">
                            Discover the most acclaimed films in our library, chosen by movie fans and critics alike based on real engagement.
                        </p>
                    </div>
                    <Link
                        href="/movies/top-rated"
                        className="group inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-4 text-xs font-black uppercase tracking-widest text-foreground shadow-sm transition-all hover:bg-muted hover:border-primary/20"
                    >
                        Browse all
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
                    {topMovies.length === 0 ? (
                        <div className="col-span-full py-20 text-center rounded-[3rem] border border-dashed border-border">
                            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No rated movies yet</p>
                        </div>
                    ) : (
                        topMovies.map((movie: any) => {
                            const genre = movie.genres?.[0]?.name || "General";
                            const rating = movie.metrics?.averageRating || "0.0";
                            
                            return (
                                <article key={movie.id} className="group relative rounded-[2.5rem] border border-border bg-card p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-black text-foreground truncate group-hover:text-primary transition-colors">{movie.title}</h3>
                                            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{genre}</p>
                                        </div>
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                            <Star className="size-5 fill-current" />
                                        </div>
                                    </div>
                                    
                                    <p className="mt-6 text-sm leading-relaxed text-muted-foreground font-medium line-clamp-2 italic h-10">
                                        {movie.description || "A masterpiece waiting for your review."}
                                    </p>
                                    
                                    <div className="mt-8 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-tighter">Avg Score</span>
                                            <span className="text-xl font-black text-foreground">
                                                {rating}
                                            </span>
                                        </div>
                                        <button className="inline-flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-foreground transition-all hover:bg-rose-500 hover:text-white hover:border-rose-500 group/btn">
                                            <Heart className="size-3 transition-transform group-hover/btn:scale-125" />
                                            Fav
                                        </button>
                                    </div>
                                    
                                    {/* Link overlay */}
                                    <Link href={`/movie/${movie.id}`} className="absolute inset-0 z-0" aria-label={`View ${movie.title}`} />
                                    
                                    {/* Small bottom accent */}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-primary/0 group-hover:bg-primary/40 rounded-t-full transition-all duration-500" />
                                </article>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
}
