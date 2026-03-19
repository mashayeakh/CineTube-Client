/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Star, Film, Clock, Play, Heart,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
    type CarouselApi
} from "@/components/ui/carousel";

interface Movie {
    id: number;
    title: string;
    releaseDate: string;
    posterPath: string;
    rating: number;
    language: string;
    duration?: string;
    isNew?: boolean;
}

const popularMovies: Movie[] = [
    {
        id: 1,
        title: "Haangor",
        releaseDate: "Mar 19, 2026",
        posterPath: "https://images.unsplash.com/photo-1534447677768-be436bb4a87c?q=80&w=1794&auto=format&fit=crop",
        rating: 8.4,
        language: "Bengali",
        duration: "2h 15m",
        isNew: true
    },
    {
        id: 2,
        title: "Durban",
        releaseDate: "Mar 19, 2026",
        posterPath: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop",
        rating: 7.9,
        language: "Bengali",
        duration: "2h 30m"
    },
    {
        id: 3,
        title: "Bonolota Express",
        releaseDate: "Mar 21, 2026",
        posterPath: "https://images.unsplash.com/photo-1543536448-1a76fc6e4f25?q=80&w=2070&auto=format&fit=crop",
        rating: 8.2,
        language: "Bengali",
        duration: "2h 45m",
        isNew: true
    },
    {
        id: 4,
        title: "Maalik",
        releaseDate: "Mar 19, 2026",
        posterPath: "https://images.unsplash.com/photo-1509347528160-9a47e3cd61b7?q=80&w=2070&auto=format&fit=crop",
        rating: 8.7,
        language: "Bengali",
        duration: "2h 20m"
    },
    {
        id: 5,
        title: "Prince: Once Upon a Time in Dhaka",
        releaseDate: "Mar 21, 2026",
        posterPath: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop",
        rating: 8.9,
        language: "Bengali",
        duration: "2h 50m",
        isNew: true
    },
    {
        id: 6,
        title: "Rakkhosh",
        releaseDate: "Mar 21, 2026",
        posterPath: "https://images.unsplash.com/photo-1533923156502-be31530547da?q=80&w=1974&auto=format&fit=crop",
        rating: 7.8,
        language: "Bengali",
        duration: "2h 10m"
    },
    {
        id: 7,
        title: "Pinik",
        releaseDate: "Mar 19, 2026",
        posterPath: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop",
        rating: 8.1,
        language: "Bengali",
        duration: "2h 25m"
    },
    {
        id: 8,
        title: "Domm",
        releaseDate: "Mar 21, 2026",
        posterPath: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=2056&auto=format&fit=crop",
        rating: 8.3,
        language: "Bengali",
        duration: "2h 35m",
        isNew: true
    },
    {
        id: 9,
        title: "Chorki",
        releaseDate: "Mar 22, 2026",
        posterPath: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop",
        rating: 8.0,
        language: "Bengali",
        duration: "2h 5m"
    },
    {
        id: 10,
        title: "Maya",
        releaseDate: "Mar 23, 2026",
        posterPath: "https://images.unsplash.com/photo-1534447677768-be436bb4a87c?q=80&w=1794&auto=format&fit=crop",
        rating: 8.6,
        language: "Bengali",
        duration: "2h 20m",
        isNew: true
    }
];

export default function PopularSection() {
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) {
            return;
        }

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    const toggleFavorite = (id: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    return (
        <section className="py-16 bg-gradient-to-b from-background to-muted/10">
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
                                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
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
                            {popularMovies.map((movie, index) => (
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
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-muted shadow-lg hover:shadow-2xl transition-all duration-500">
                    {/* Poster Image */}
                    <img
                        src={movie.posterPath}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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
                                className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent"
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