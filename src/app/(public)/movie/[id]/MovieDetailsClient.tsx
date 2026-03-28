/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
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
import { useRouter } from "next/navigation";

interface ReviewComment {
    id: string;
    userId: string;
    content: string;
    isSpoiler: boolean;
    createdAt: string;
}

interface Review {
    id: string;
    userId: string;
    rating: number;
    content: string;
    isSpoiler: boolean;
    tags: string[];
    status: string;
    createdAt: string;
    comments: ReviewComment[];
}

interface Movie {
    id: string;
    title: string;
    releaseDate: string;
    posterPath: string;
    backdropPath?: string;
    rating: number;
    language: string;
    // duration: string;
    genre: string[];
    isNew?: boolean;
    votes: number;
    certification?: string;
    tagline?: string;
    overview?: string;
    ageGroup?: string;
    priceType?: string;
    director?: { name: string; role: string };
    writers?: { name: string; role: string }[];
    cast?: { name: string; character: string; avatar?: string }[];
    reviews?: Review[];
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


                    <img src={movie.backdropPath || movie.posterPath} className="w-full h-full object-cover" />
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
                                {/* <span className="flex items-center gap-1">
                                    <Clock className="size-4" />
                                    {movie.duration}
                                </span> */}
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
                        {(!movie.reviews || movie.reviews.length === 0) ? (
                            <div className="text-center py-20 text-muted-foreground">
                                <Star className="size-12 mx-auto mb-4 opacity-50" />
                                <p>No reviews yet</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <p className="text-sm text-muted-foreground">{movie.reviews.length} review{movie.reviews.length !== 1 ? 's' : ''}</p>
                                {movie.reviews.map((review) => (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-card border border-border/50 rounded-2xl p-6 space-y-4"
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10">
                                                    <AvatarFallback>{review.userId.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-sm">{review.userId.slice(0, 8)}…</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {/* Rating */}
                                                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded-full">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={cn(
                                                                "size-3",
                                                                i < review.rating
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "text-muted-foreground/30"
                                                            )}
                                                        />
                                                    ))}
                                                    <span className="text-xs font-medium ml-1">{review.rating}/5</span>
                                                </div>
                                                {/* Status badge */}
                                                <Badge
                                                    variant={review.status === 'APPROVED' ? 'default' : 'secondary'}
                                                    className={cn(
                                                        "text-xs",
                                                        review.status === 'APPROVED'
                                                            ? 'bg-green-500/10 text-green-600 border-green-500/30'
                                                            : 'bg-red-500/10 text-red-500 border-red-500/30'
                                                    )}
                                                >
                                                    {review.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Spoiler warning */}
                                        {review.isSpoiler && (
                                            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-600">
                                                <Sparkles className="size-4" />
                                                <span>This review may contain spoilers</span>
                                            </div>
                                        )}

                                        {/* Content */}
                                        <p className="text-muted-foreground leading-relaxed">{review.content}</p>

                                        {/* Tags */}
                                        {review.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {review.tags.map((tag) => (
                                                    <Badge key={tag} variant="secondary" className="text-xs">
                                                        #{tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        {/* Comments */}
                                        {review.comments.length > 0 && (
                                            <div className="mt-4 pl-4 border-l-2 border-border space-y-3">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                    {review.comments.length} Comment{review.comments.length !== 1 ? 's' : ''}
                                                </p>
                                                {review.comments.map((comment) => (
                                                    <div key={comment.id} className="flex items-start gap-3">
                                                        <Avatar className="w-7 h-7 shrink-0">
                                                            <AvatarFallback className="text-xs">{comment.userId.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-semibold">{comment.userId.slice(0, 8)}…</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                </span>
                                                                {comment.isSpoiler && (
                                                                    <Badge variant="secondary" className="text-xs py-0">spoiler</Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">{comment.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

        </div>
    );
}
