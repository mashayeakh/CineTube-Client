/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Star, Film, Clock, Play, Heart,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getPopularMovies } from '@/app/(public)/public/_actions/popular';
import { resolveMediaUrl } from '@/lib/media';
import { Skeleton } from '@/components/ui/skeleton';

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
    type CarouselApi
} from "@/components/ui/carousel";

interface PopularApiMovie {
    id: string;
    title: string;
    description?: string;
    poster?: string;
    releaseYear?: number;
    director?: string;
    score?: number;
    reviews?: Array<{ rating?: number; status?: string }>;
    createdAt?: string;
}

interface Movie {
    id: string;
    title: string;
    releaseDate: string;
    posterPath: string;
    rating: number;
    language: string;
    duration?: string;
    isNew?: boolean;
}

function mapToMovie(movie: PopularApiMovie): Movie {
    const approvedReviews = (movie.reviews ?? []).filter((r) => r.status === 'APPROVED');
    const avgRating =
        approvedReviews.length > 0
            ? Number(
                (
                    approvedReviews.reduce((sum, r) => sum + Number(r.rating ?? 0), 0) /
                    approvedReviews.length
                ).toFixed(1)
            )
            : Number(movie.score ?? 0);

    const isNew = movie.createdAt
        ? Date.now() - new Date(movie.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
        : false;

    return {
        id: movie.id,
        title: movie.title,
        releaseDate: movie.releaseYear ? `${movie.releaseYear}-01-01` : '',
        posterPath:
            resolveMediaUrl(movie.poster) ||
            'https://images.unsplash.com/photo-1534809027769-b00d750a2883',
        rating: avgRating,
        language: movie.director ?? '—',
        isNew,
    };
}

export default function PopularSection() {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    const { data: rawMovies, isLoading, error } = useQuery({
        queryKey: ['popular-movies'],
        queryFn: getPopularMovies,
    });

    const movies: Movie[] = (rawMovies as PopularApiMovie[] | undefined)?.map(mapToMovie) ?? [];

    const count = api ? api.scrollSnapList().length : 0;

    useEffect(() => {
        if (!api) return;

        const onSelect = () => {
            setCurrent(api.selectedScrollSnap() + 1);
        };
        api.on("select", onSelect);
        return () => { api.off("select", onSelect); };
    }, [api]);

    const toggleFavorite = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    if (isLoading) {
        return (
            <section className="bg-linear-to-b from-background to-muted/10 py-16">
                <div className="container mx-auto px-4">
                    <div className="mb-10 flex items-center justify-between">
                        <div className="space-y-3">
                            <Skeleton className="h-5 w-28 rounded-full" />
                            <Skeleton className="h-10 w-60 rounded-full" />
                        </div>
                        <Skeleton className="hidden h-10 w-24 rounded-full sm:block" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={`popular-home-skeleton-${index}`} className="space-y-3">
                                <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
                                <Skeleton className="h-5 w-4/5 rounded-full" />
                                <Skeleton className="h-4 w-1/2 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }
    if (error) return <p>Failed to load popular movies.</p>;

    return (
        <section className="py-16 bg-linear-to-b from-background to-muted/10">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-10"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Film className="size-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold">
                                <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    Whats Popular
                                </span>
                            </h2>
                            <p className="text-muted-foreground mt-1">
                                Latest releases in Bengali cinema
                            </p>
                        </div>
                    </div>

                    {/* View All Link */}
                    <Link
                        href="/popular"
                        className="group hidden sm:flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                    >
                        <span>View All</span>
                        <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

                {/* Carousel */}
                <div className="relative px-12">
                    <Carousel
                        setApi={setApi}
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-2 md:-ml-4">
                            {movies.map((movie, index) => (
                                <CarouselItem
                                    key={movie.id}
                                    className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                                >
                                    <MovieCard
                                        movie={movie}
                                        index={index}
                                        isHovered={hoveredId === movie.id}
                                        isFavorite={favorites.includes(movie.id)}
                                        onHover={() => setHoveredId(movie.id)}
                                        onLeave={() => setHoveredId(null)}
                                        onFavoriteToggle={(e) => toggleFavorite(movie.id, e)}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {/* Custom Navigation Buttons */}
                        <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border border-border hover:bg-primary hover:text-white transition-all duration-300" />
                        <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border border-border hover:bg-primary hover:text-white transition-all duration-300" />
                    </Carousel>

                    {/* Progress Indicators */}
                    {count > 0 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            {Array.from({ length: count }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => api?.scrollTo(i)}
                                    className={cn(
                                        "h-2 rounded-full transition-all duration-300",
                                        current === i + 1
                                            ? "w-8 bg-primary"
                                            : "w-2 bg-primary/30 hover:bg-primary/50"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Mobile View All Button */}
                <motion.div
                    className="flex justify-center mt-8 sm:hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Link
                        href="/popular"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
                    >
                        <span>View All Movies</span>
                        <ChevronRight className="size-4" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

interface MovieCardProps {
    movie: Movie;
    index: number;
    isHovered: boolean;
    isFavorite: boolean;
    onHover: () => void;
    onLeave: () => void;
    onFavoriteToggle: (e: React.MouseEvent) => void;
}

const MovieCard = ({
    movie,
    index,
    isHovered,
    isFavorite,
    onHover,
    onLeave,
    onFavoriteToggle
}: MovieCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onHoverStart={onHover}
            onHoverEnd={onLeave}
            className="group relative"
        >
            <Link href={`/movie/${movie.id}`}>
                <div className="relative aspect-2/3 rounded-2xl overflow-hidden bg-muted shadow-lg hover:shadow-2xl transition-all duration-500">
                    {/* Poster Image */}
                    <img
                        src={movie.posterPath}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* New Badge */}
                    {movie.isNew && (
                        <motion.div
                            initial={{ x: -100 }}
                            animate={{ x: 0 }}
                            className="absolute top-3 left-3"
                        >
                            <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-lg">
                                NEW
                            </span>
                        </motion.div>
                    )}

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-sm font-medium">
                        <Star className="size-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-white">{movie.rating}</span>
                    </div>

                    {/* Favorite Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onFavoriteToggle}
                        className="absolute bottom-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary/80"
                    >
                        <Heart
                            className={cn(
                                "size-4 transition-colors",
                                isFavorite ? "fill-red-500 text-red-500" : "text-white"
                            )}
                        />
                    </motion.button>

                    {/* Hover Content */}
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black via-black/80 to-transparent"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                        <Calendar className="size-3" />
                                        <span>{movie.releaseDate}</span>
                                    </div>
                                    {movie.duration && (
                                        <div className="flex items-center gap-2 text-sm text-white/80">
                                            <Clock className="size-3" />
                                            <span>{movie.duration}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 pt-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white text-sm font-medium transition-colors"
                                        >
                                            <Play className="size-3 fill-white" />
                                            <span>Trailer</span>
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Movie Info */}
                <div className="mt-3 px-1 space-y-1">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {movie.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{movie.language}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};