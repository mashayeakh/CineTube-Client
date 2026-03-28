


"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Calendar, Clock, Star, Eye, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getTrendingMoviesToday } from "@/app/(public)/movie/_actions/trending";

interface TrendingApiMovie {
  id: string;
  title: string;
  description?: string;
  poster?: string;
  releaseYear?: number;
  score?: number;
  reviews?: Array<{ rating?: number }>;
}

interface TrendingItem {
  id: string;
  title: string;
  posterPath: string;
  rating: number;
  mediaType: "movie" | "tv";
  year: string;
  overview: string;
  score: number;
}

export default function TrendingSection() {
  const [activeTab, setActiveTab] = useState<"today" | "week">("today");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["trending-movies", activeTab],
    queryFn: () => getTrendingMoviesToday(activeTab),
  });

  if (isLoading) return <p>Loading trending...</p>;
  if (error) return <p>Failed to load trending</p>;

  const currentData: TrendingItem[] =
    (data as TrendingApiMovie[] | undefined)?.map((movie) => {
      const reviewRatings = (movie.reviews ?? [])
        .map((review) => Number(review.rating ?? 0))
        .filter((rating) => Number.isFinite(rating) && rating > 0);

      const averageRating =
        reviewRatings.length > 0
          ? Number(
            (reviewRatings.reduce((sum, value) => sum + value, 0) /
              reviewRatings.length).toFixed(1)
          )
          : Number(movie.score ?? 0);

      return {
        id: movie.id,
        title: movie.title,
        posterPath:
          movie.poster ||
          "https://images.unsplash.com/photo-1534809027769-b00d750a2883",
        rating: averageRating,
        mediaType: "movie",
        year: movie.releaseYear ? String(movie.releaseYear) : "N/A",
        overview: movie.description ?? "No description available",
        score: Number(movie.score ?? 0),
      };
    }) || [];

  return (
    <section className="py-8 bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 border border-green-600">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <TrendingUp className="size-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Trending
              </h2>
              <p className="text-muted-foreground body-font">
                Most popular movies and shows
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-muted/50 rounded-full">
            <TabButton
              active={activeTab === "today"}
              onClick={() => setActiveTab("today")}
              icon={<Clock className="size-4" />}
              label="Today"
            />
            <TabButton
              active={activeTab === "week"}
              onClick={() => setActiveTab("week")}
              icon={<Calendar className="size-4" />}
              label="This Week"
            />
          </div>
        </div>

        {/* GRID (UNCHANGED DESIGN) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 body-font"
          >
            {currentData.map((item, index) => (
              <TrendingCard
                key={item.id}
                item={item}
                index={index}
                isHovered={hoveredId === item.id}
                onHover={() => setHoveredId(item.id)}
                onLeave={() => setHoveredId(null)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ---------------- TAB BUTTON ---------------- */
const TabButton = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "relative flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
      active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
    )}
  >
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 bg-primary rounded-full"
        transition={{ type: "spring", duration: 0.5 }}
      />
    )}
    <span className="relative z-10 flex items-center gap-2">
      {icon}
      {label}
    </span>
  </button>
);

/* ---------------- CARD (UNCHANGED DESIGN) ---------------- */
const TrendingCard = ({
  item,
  index,
  isHovered,
  onHover,
  onLeave,
}: {
  item: TrendingItem;
  index: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
      className="group relative"
    >
      <Link href={`/${item.mediaType}/${item.id}`}>
        <div className="relative aspect-5/6 rounded-2xl overflow-hidden bg-muted">
          {/* IMAGE */}
          <img
            src={item.posterPath}
            className="object-cover transition-transform duration-700 group-hover:scale-110 w-full h-full"
            alt={item.title}
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* RATING */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-sm font-medium">
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
            <span className="text-white">{item.rating}</span>
          </div>

          {/* TYPE */}
          <div className="absolute top-3 left-3 px-2 py-1 bg-primary/90 rounded-full text-xs text-white">
            {item.mediaType === "movie" ? "MOVIE" : "TV SERIES"}
          </div>

          {/* HOVER */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-0 flex flex-col justify-end p-4 bg-linear-to-t from-black/90 via-black/40 to-transparent"
              >
                <div className="text-white">
                  <div className="flex items-center gap-2 mb-2 text-sm">
                    <Eye className="size-3" />
                    <span>Score: {item.score}</span>
                  </div>

                  <p className="text-sm line-clamp-2 text-white/80">
                    {item.overview}
                  </p>

                  <div className="flex items-center gap-2 mt-3">
                    <Heart className="size-4 text-red-500" />
                    <span className="text-sm">Add to Watchlist</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* RANK */}
          <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {index + 1}
          </div>
        </div>

        {/* TITLE */}
        <div className="mt-3 px-1">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {item.title}
          </h3>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{item.year}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Star className="size-3 fill-yellow-400 text-yellow-400" />
              {item.rating}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};