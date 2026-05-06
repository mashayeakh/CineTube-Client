"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getMovies, MovieListItem } from "@/app/(public)/public/_actions";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowRight } from "lucide-react";

export default function NewReleasesSection() {
    const { data: movies, isLoading, error } = useQuery({
        queryKey: ["new-releases"],
        queryFn: getMovies,
    });

    if (isLoading) {
        return (
            <section className="py-16 bg-background text-foreground" id="new-releases">
                <div className="container mx-auto px-4">
                    <div className="mb-10">
                        <Skeleton className="h-4 w-32 mb-4" />
                        <Skeleton className="h-10 w-64 mb-4" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-[2.5rem] border border-border bg-card p-8 shadow-sm">
                                <Skeleton className="h-6 w-12 rounded-full mb-8" />
                                <Skeleton className="h-8 w-48 mb-4" />
                                <Skeleton className="h-4 w-32 mb-8" />
                                <Skeleton className="h-16 w-full mb-8" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16 bg-background text-foreground" id="new-releases">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-rose-100 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-12 text-center">
                        <AlertCircle className="size-10 text-rose-500 mb-4" />
                        <h3 className="text-xl font-bold text-foreground">Failed to load new releases</h3>
                        <p className="text-sm text-muted-foreground mt-2">There was an error fetching the latest movies. Please try again later.</p>
                    </div>
                </div>
            </section>
        );
    }

    // Sort by createdAt desc if available, otherwise just take first 3
    const latestMovies = [...(movies || [])]
        .sort((a: MovieListItem, b: MovieListItem) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        })
        .slice(0, 3);

    return (
        <section className="py-20 bg-background/50 text-foreground border-y border-border/50" id="new-releases">
            <div className="container mx-auto px-4">
                <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
                            New Releases
                        </p>
                        <h2 className="mt-4 text-4xl font-black text-foreground tracking-tight sm:text-5xl">
                            Fresh movies added this week
                        </h2>
                        <p className="mt-4 max-w-2xl text-sm text-muted-foreground font-medium leading-relaxed">
                            Check out the latest arrivals and stay ahead of the new cinematic wave with our curated selections.
                        </p>
                    </div>
                    <Link
                        href="/movies/all-movies"
                        className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 text-xs font-bold text-foreground shadow-sm transition-all hover:bg-muted hover:border-muted-foreground/20"
                    >
                        See all releases
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {latestMovies.length === 0 ? (
                        <div className="col-span-full py-24 text-center rounded-[3rem] border-2 border-dashed border-border bg-card/50">
                            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No new releases found</p>
                        </div>
                    ) : (
                        latestMovies.map((movie: MovieListItem) => {
                            const genreSource = movie.genres || [];
                            const genre = Array.isArray(genreSource) && genreSource.length > 0 
                                ? genreSource[0].name 
                                : "General";
                            const year = movie.releaseYear || (movie.createdAt ? new Date(movie.createdAt).getFullYear() : "2026");
                            
                            return (
                                <div key={movie.id} className="group relative overflow-hidden rounded-[3rem] border border-border bg-card p-10 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2">
                                    <div className="relative z-10">
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase text-primary tracking-widest">
                                            NEW
                                        </span>
                                        <h3 className="mt-8 text-2xl font-black text-foreground line-clamp-1 group-hover:text-primary transition-colors">{movie.title}</h3>
                                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
                                            {genre} • {year}
                                        </p>
                                        <p className="mt-6 text-sm leading-relaxed text-muted-foreground font-medium line-clamp-2 italic">
                                            {movie.description || "A captivating new addition to our collection, waiting for your first review."}
                                        </p>
                                        <div className="mt-10">
                                            <Link
                                                href={`/movie/${movie.id}`}
                                                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground transition-all hover:gap-4 hover:text-primary"
                                            >
                                                Watch now
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </div>
                                    </div>
                                    
                                    {/* Decorative background element */}
                                    <div className="absolute -right-8 -bottom-8 size-32 rounded-full bg-muted/30 group-hover:bg-primary/5 transition-colors duration-500" />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
}
