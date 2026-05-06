"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Star, Quote } from "lucide-react";
import { getLatestReviews, ReviewItem } from "@/app/(public)/public/_actions/reviews";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";

export default function LatestReviewsSection() {
    const { data: reviews, isLoading, error } = useQuery({
        queryKey: ["latest-reviews"],
        queryFn: getLatestReviews,
    });

    if (isLoading) {
        return (
            <section className="py-20 bg-background" id="reviews">
                <div className="container mx-auto px-4">
                    <div className="mb-12">
                        <Skeleton className="h-4 w-32 mb-4" />
                        <Skeleton className="h-10 w-64 mb-4" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-64 w-full rounded-[2.5rem]" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-20 bg-background" id="reviews">
                <div className="container mx-auto px-4">
                    <div className="text-center py-12 rounded-[2.5rem] border border-border bg-muted/20">
                        <p className="text-muted-foreground font-medium">Failed to load reviews. Please try again later.</p>
                    </div>
                </div>
            </section>
        );
    }

    const sortedReviews = [...(reviews || [])].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const hasReviews = sortedReviews.length > 0;
    const useCarousel = sortedReviews.length > 3;

    return (
        <section className="py-20 bg-background text-foreground" id="reviews">
            <div className="container mx-auto px-4">
                <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
                            Latest Reviews
                        </p>
                        <h2 className="mt-4 text-4xl font-black text-foreground tracking-tight sm:text-5xl">
                            Fresh opinions from film lovers
                        </h2>
                        <p className="mt-4 max-w-2xl text-sm text-muted-foreground font-medium leading-relaxed">
                            Read short reviews from the community to find your next favorite movie and see what others are saying.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-3 rounded-2xl bg-muted/50 border border-border px-5 py-2.5 text-xs font-bold text-foreground">
                        <MessageCircle className="size-4 text-primary" />
                        {sortedReviews.length} recent reviews
                    </div>
                </div>

                {!hasReviews ? (
                    <div className="py-24 text-center rounded-[3rem] border-2 border-dashed border-border bg-muted/10">
                        <Quote className="size-12 text-muted-foreground/20 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-foreground">No reviews exist yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Be the first to share your thoughts on a movie!</p>
                    </div>
                ) : useCarousel ? (
                    <div className="px-12">
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-6">
                                {sortedReviews.map((review) => (
                                    <CarouselItem key={review.id} className="pl-6 md:basis-1/2 lg:basis-1/3">
                                        <ReviewCard review={review} />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="-left-12 h-12 w-12 border-border hover:bg-primary hover:text-primary-foreground" />
                            <CarouselNext className="-right-12 h-12 w-12 border-border hover:bg-primary hover:text-primary-foreground" />
                        </Carousel>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {sortedReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function ReviewCard({ review }: { review: ReviewItem }) {
    const authorName = review.user?.name || "Anonymous User";
    const subjectTitle = review.movie?.title || review.series?.title || "Unknown Title";
    const formattedDate = new Date(review.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    return (
        <article className="h-full flex flex-col justify-between rounded-[2.5rem] border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1">
            <div>
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Star className="size-6 fill-primary/20" />
                    </div>
                    <div>
                        <p className="font-black text-foreground">{authorName}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            {formattedDate}
                        </p>
                    </div>
                </div>
                <div className="mt-8 space-y-4">
                    <div className="inline-flex rounded-lg bg-muted px-2.5 py-1 text-[10px] font-black uppercase text-muted-foreground tracking-tighter">
                        Regarding: {subjectTitle}
                    </div>
                    <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2 italic">
                        &ldquo;{review.content.length > 60 ? review.content.substring(0, 60) + "..." : review.content}&rdquo;
                    </h3>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                            key={star} 
                            className={cn(
                                "size-3", 
                                star <= review.rating ? "fill-primary text-primary" : "fill-muted text-muted"
                            )} 
                        />
                    ))}
                </div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                    Community Pick
                </span>
            </div>
        </article>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
