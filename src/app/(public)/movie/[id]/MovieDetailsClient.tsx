/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Film,
    Heart,
    Share2,
    Bookmark,
    Calendar,
    Sparkles,
    CirclePlay,
    User,
    Award,
    Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { movies } from "@/app/data/movies";

interface Movie {
    id: number;
    title: string;
    releaseDate: string;
    posterPath: string;
    backdropPath?: string;
    rating: number;
    language: string;
    duration: string;
    genre: string[];
    isNew?: boolean;
    votes: number;
    certification?: string;
    tagline?: string;
    overview?: string;
    director?: { name: string; role: string };
    writers?: { name: string; role: string }[];
    cast?: { name: string; character: string; avatar?: string }[];
}

function formatReleaseDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric"
    });
}

export default function MovieDetailsClient({ movie }: { movie: Movie }) {
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const formattedDate = formatReleaseDate(movie.releaseDate);

    return (
        <div className="min-h-screen bg-linear-to-b from-background to-muted/10">
            <div className="relative h-[60vh] min-h-125 w-full">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 z-30 rounded-full text-black hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
                >
                    <ChevronLeft className="size-4" />
                    Back
                </Button>
                <div className="absolute inset-0">


                    <img src={movie.backdropPath || movie.posterPath} alt={movie.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent" />
                    <div className="absolute inset-0 bg-linear-to-r from-background via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-16">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-8 items-end">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="hidden md:block w-100 rounded-2xl overflow-hidden shadow-2xl border-4 border-background">
                            <img src={movie.posterPath} alt={movie.title} className="w-full h-full object-cover" />
                        </motion.div>
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                                    {movie.title} <span className="text-2xl text-muted-foreground">({new Date(movie.releaseDate).getFullYear()})</span>
                                </h1>
                                {movie.certification && (
                                    <Badge variant="outline" className="border-primary/50 text-primary">
                                        {movie.certification}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                    <Calendar className="size-4" />
                                    {formattedDate} (BD)
                                </span>
                                <span>•</span>
                                <span>{movie.genre.join(', ')}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="size-4" />
                                    {movie.duration}
                                </span>
                            </div>
                            <div className="flex items-center gap-6 flex-wrap">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-xl font-bold text-primary">{movie.rating}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-semibold">User Score</p>
                                        <p className="text-sm text-muted-foreground">{movie.votes.toLocaleString()} votes</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Sparkles className="size-4" />
                                        What is your Vibe?
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 ml-auto">
                                    <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                                        <CirclePlay className="size-5" /> Play Trailer
                                    </Button>
                                    <Button variant="outline" size="icon" className="rounded-full" onClick={() => setIsFavorite(!isFavorite)}>
                                        <Heart className={cn("size-4", isFavorite && "fill-red-500 text-red-500")} />
                                    </Button>
                                    <Button variant="outline" size="icon" className="rounded-full" onClick={() => setIsInWatchlist(!isInWatchlist)}>
                                        <Bookmark className={cn("size-4", isInWatchlist && "fill-primary text-primary")} />
                                    </Button>
                                    <Button variant="outline" size="icon" className="rounded-full">
                                        <Share2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                            {movie.tagline && <p className="text-lg italic text-muted-foreground">{movie.tagline}</p>}
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-8">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
                        <TabsTrigger value="media">Media</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-8">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                {movie.overview && (
                                    <div>
                                        <h3 className="text-xl font-semibold mb-3">Overview</h3>
                                        <p className="text-muted-foreground leading-relaxed">{movie.overview}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-6">
                                    {movie.director && (
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Director</h4>
                                            <p className="font-semibold">{movie.director.name}</p>
                                            <p className="text-sm text-muted-foreground">{movie.director.role}</p>
                                        </div>
                                    )}
                                    {movie.writers && movie.writers.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Writer</h4>
                                            {movie.writers.map((writer, idx) => (
                                                <div key={idx}>
                                                    <p className="font-semibold">{writer.name}</p>
                                                    <p className="text-sm text-muted-foreground">{writer.role}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-card border border-border/50 rounded-2xl p-6">
                                    <h4 className="font-semibold mb-4">Movie Info</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Status</p>
                                            <p className="font-medium">Released</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Original Language</p>
                                            <p className="font-medium">{movie.language}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-card border border-border/50 rounded-2xl p-6">
                                    <h4 className="font-semibold mb-4">Keywords</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {movie.genre.map((g) => (
                                            <Badge key={g} variant="secondary">{g}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {movie.cast && movie.cast.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold">Top Cast</h3>
                                    <Button variant="ghost" size="sm" className="gap-1" onClick={() => setActiveTab("cast")}>
                                        View All <ChevronRight className="size-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {movie.cast.slice(0, 6).map((actor, idx) => (
                                        <motion.div key={idx} whileHover={{ scale: 1.05 }} className="bg-card border border-border/50 rounded-xl p-4 text-center">
                                            <Avatar className="w-20 h-20 mx-auto mb-3 border-2 border-primary/20">
                                                <AvatarImage src={actor.avatar} alt={actor.name} />
                                                <AvatarFallback>{actor.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <p className="font-semibold text-sm">{actor.name}</p>
                                            <p className="text-xs text-muted-foreground">{actor.character}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="cast">
                        <div className="grid md:grid-cols-2 gap-8">
                            {movie.cast && movie.cast.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Cast</h3>
                                    <div className="space-y-3">
                                        {movie.cast.map((actor, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-card border border-border/50 rounded-xl">
                                                <Avatar className="w-10 h-10">
                                                    <AvatarImage src={actor.avatar} alt={actor.name} />
                                                    <AvatarFallback>{actor.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{actor.name}</p>
                                                    <p className="text-sm text-muted-foreground">{actor.character}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-xl font-semibold mb-4">Crew</h3>
                                <div className="space-y-3">
                                    {movie.director && (
                                        <div className="flex items-center gap-3 p-3 bg-card border border-border/50 rounded-xl">
                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                <User className="size-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{movie.director.name}</p>
                                                <p className="text-sm text-muted-foreground">{movie.director.role}</p>
                                            </div>
                                        </div>
                                    )}
                                    {movie.writers?.map((writer, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-card border border-border/50 rounded-xl">
                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                <Award className="size-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{writer.name}</p>
                                                <p className="text-sm text-muted-foreground">{writer.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="media">
                        <div className="text-center py-20 text-muted-foreground">
                            <Film className="size-12 mx-auto mb-4 opacity-50" />
                            <p>Media gallery coming soon</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="reviews">
                        <div className="text-center py-20 text-muted-foreground">
                            <Star className="size-12 mx-auto mb-4 opacity-50" />
                            <p>No reviews yet</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <div className="container mx-auto px-4 py-12 border-t border-border/50">
                <h3 className="text-2xl font-bold mb-6">You might also like</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {movies
                        .filter((m) => m.id !== movie.id)
                        .slice(0, 6)
                        .map((m) => (
                            <Link key={m.id} href={`/movie/${m.id}`}>
                                <motion.div whileHover={{ scale: 1.05 }} className="aspect-[2/3] bg-muted rounded-xl overflow-hidden relative group">
                                    <img src={m.posterPath} alt={m.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                        <p className="text-white text-sm font-medium line-clamp-2">{m.title}</p>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                </div>
            </div>
        </div>
    );
}
