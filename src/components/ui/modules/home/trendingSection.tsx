/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Film, Tv, Star, Calendar, Clock, Eye, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface TrendingItem {
  id: number;
  title: string;
  posterPath: string;
  rating: number;
  mediaType: 'movie' | 'tv';
  year: string;
  overview: string;
}

const trendingData: Record<'today' | 'week', TrendingItem[]> = {
  today: [
    {
      id: 1,
      title: "Dune: Part Two",
      posterPath: "https://images.unsplash.com/photo-1534809027769-b00d750a2883?q=80&w=1974&auto=format&fit=crop",
      rating: 8.7,
      mediaType: 'movie',
      year: '2024',
      overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family."
    },
    {
      id: 2,
      title: "The Bear",
      posterPath: "https://images.unsplash.com/photo-1551022372-0bdac482d76b?q=80&w=1974&auto=format&fit=crop",
      rating: 8.9,
      mediaType: 'tv',
      year: '2023-2024',
      overview: "A young chef from the fine dining world returns to Chicago to run his family's sandwich shop."
    },
    {
      id: 3,
      title: "Oppenheimer",
      posterPath: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop",
      rating: 8.5,
      mediaType: 'movie',
      year: '2023',
      overview: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb."
    },
    {
      id: 4,
      title: "Succession",
      posterPath: "https://images.unsplash.com/photo-1542204160-126bf84d066b?q=80&w=1974&auto=format&fit=crop",
      rating: 9.0,
      mediaType: 'tv',
      year: '2018-2023',
      overview: "The Roy family is known for controlling the biggest media and entertainment company in the world."
    }
  ],
  week: [
    {
      id: 5,
      title: "House of the Dragon",
      posterPath: "https://images.unsplash.com/photo-1610890690587-5c919b8c7a4b?q=80&w=1965&auto=format&fit=crop",
      rating: 8.8,
      mediaType: 'tv',
      year: '2022-2024',
      overview: "An internal succession war within House Targaryen at the height of its power, 172 years before the birth of Daenerys Targaryen."
    },
    {
      id: 6,
      title: "Poor Things",
      posterPath: "https://images.unsplash.com/photo-1533923156502-be31530547da?q=80&w=1974&auto=format&fit=crop",
      rating: 8.3,
      mediaType: 'movie',
      year: '2023',
      overview: "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter."
    },
    {
      id: 7,
      title: "True Detective",
      posterPath: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=crop",
      rating: 8.4,
      mediaType: 'tv',
      year: '2024',
      overview: "In Night Country, the investigation into the disappearance of eight men at the Tsalal Arctic Research Station leads Detective Liz Danvers and Trooper Evangeline Navarro."
    },
    {
      id: 8,
      title: "The Zone of Interest",
      posterPath: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop",
      rating: 8.2,
      mediaType: 'movie',
      year: '2023',
      overview: "The commandant of Auschwitz, Rudolf Höss, and his wife Hedwig strive to build a dream life for their family in a house and garden next to the camp."
    }
  ]
};

export default function TrendingSection() {
  const [activeTab, setActiveTab] = useState<'today' | 'week'>('today');
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const currentData = trendingData[activeTab];

  return (
    <section className="py-8 bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 border border-green-600">
        {/* Header with gradient */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <TrendingUp className="size-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Trending
              </h2>
              <p className="text-muted-foreground body-font">Most popular movies and shows</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 p-1 bg-muted/50 rounded-full">
            <TabButton
              active={activeTab === 'today'}
              onClick={() => setActiveTab('today')}
              icon={<Clock className="size-4" />}
              label="Today"
            />
            <TabButton
              active={activeTab === 'week'}
              onClick={() => setActiveTab('week')}
              icon={<Calendar className="size-4" />}
              label="This Week"
            />
          </div>
        </div>

        {/* Trending Grid */}
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

        {/* View All Button */}
        <motion.div
          className="flex justify-center mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >

        </motion.div>
      </div>
    </section>
  );
}

// Tab Button Component
const TabButton = ({ active, onClick, icon, label }: {
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

// Trending Card Component
const TrendingCard = ({ item, index, isHovered, onHover, onLeave }: {
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
          {/* Poster Image */}
          {/* <Image
            src={item.posterPath}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          /> */}

          <img
            src={item.posterPath}
            className="object-cover transition-transform duration-700 group-hover:scale-110 w-full h-full"
            alt={item.title} />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-sm font-medium">
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
            <span className="text-white">{item.rating}</span>
          </div>

          {/* Media Type Badge */}
          <div className="absolute top-3 left-3 px-2 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-xs font-medium text-white">
            {item.mediaType === 'movie' ? 'MOVIE' : 'TV SERIES'}
          </div>

          {/* Hover Content */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
              >
                <div className="text-white">
                  <div className="flex items-center gap-2 mb-2 text-sm">
                    <Calendar className="size-3" />
                    <span>{item.year}</span>
                    <Eye className="size-3 ml-2" />
                    <span>2.5M views</span>
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

          {/* Rank Number */}
          <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {index + 1}
          </div>
        </div>

        {/* Title and Info */}
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