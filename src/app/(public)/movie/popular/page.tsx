/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

import Image from 'next/image';
import {
    Film,
    Star,
    Calendar,
    Clock,
    Filter,
    SlidersHorizontal,
    X,
    ChevronDown,
    Search,
    Heart,
    Eye,
    TrendingUp
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { movies } from '@/app/data/movies';

// Movie interface
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
    director?: {
        name: string;
        role: string;
    };
    writers?: {
        name: string;
        role: string;
    }[];
    cast?: {
        name: string;
        character: string;
        avatar?: string;
    }[];
}

// Sample movie data
// const movies: Movie[] = [
//     // {
//     //     id: 1,
//     //     title: "Haangor",
//     //     releaseDate: "Mar 19, 2026",
//     //     posterPath: "https://images.unsplash.com/photo-1534447677768-be436bb4a87c?q=80&w=1794&auto=format&fit=crop",
//     //     rating: 8.4,
//     //     language: "Bengali",
//     //     duration: "2h 15m",
//     //     genre: ["Drama", "History"],
//     //     isNew: true,
//     //     votes: 2450
//     // },
//     // {
//     //     id: 2,
//     //     title: "Durban",
//     //     releaseDate: "Mar 19, 2026",
//     //     posterPath: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop",
//     //     rating: 7.9,
//     //     language: "Bengali",
//     //     duration: "2h 30m",
//     //     genre: ["Action", "Thriller"],
//     //     votes: 1890
//     // },
//     // {
//     //     id: 3,
//     //     title: "Bonolota Express",
//     //     releaseDate: "Mar 21, 2026",
//     //     posterPath: "https://images.unsplash.com/photo-1543536448-1a76fc6e4f25?q=80&w=2070&auto=format&fit=crop",
//     //     rating: 8.2,
//     //     language: "Bengali",
//     //     duration: "2h 45m",
//     //     genre: ["Romance", "Drama"],
//     //     isNew: true,
//     //     votes: 3120
//     // },
//     // {
//     //     id: 4,
//     //     title: "Maalik",
//     //     releaseDate: "Mar 19, 2026",
//     //     posterPath: "https://images.unsplash.com/photo-1509347528160-9a47e3cd61b7?q=80&w=2070&auto=format&fit=crop",
//     //     rating: 8.7,
//     //     language: "Bengali",
//     //     duration: "2h 20m",
//     //     genre: ["Crime", "Drama"],
//     //     votes: 4230
//     // },
//     // {
//     //     id: 5,
//     //     title: "Prince: Once Upon a Time in Dhaka",
//     //     releaseDate: "Mar 21, 2026",
//     //     posterPath: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop",
//     //     rating: 8.9,
//     //     language: "Bengali",
//     //     duration: "2h 50m",
//     //     genre: ["Biography", "Drama"],
//     //     isNew: true,
//     //     votes: 5670
//     // },
//     // {
//     //     id: 6,
//     //     title: "Rakkhosh",
//     //     releaseDate: "Mar 21, 2026",
//     //     posterPath: "https://images.unsplash.com/photo-1533923156502-be31530547da?q=80&w=1974&auto=format&fit=crop",
//     //     rating: 7.8,
//     //     language: "Bengali",
//     //     duration: "2h 10m",
//     //     genre: ["Horror", "Thriller"],
//     //     votes: 1560
//     // },
//     // {
//     //     id: 7,
//     //     title: "Pinik",
//     //     releaseDate: "Mar 19, 2026",
//     //     posterPath: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop",
//     //     rating: 8.1,
//     //     language: "Bengali",
//     //     duration: "2h 25m",
//     //     genre: ["Comedy", "Drama"],
//     //     votes: 2780
//     // },
//     // {
//     //     id: 8,
//     //     title: "Domm",
//     //     releaseDate: "Mar 21, 2026",
//     //     posterPath: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=2056&auto=format&fit=crop",
//     //     rating: 8.3,
//     //     language: "Bengali",
//     //     duration: "2h 35m",
//     //     genre: ["Action", "Crime"],
//     //     isNew: true,
//     //     votes: 3450
//     // },
//     // {
//     //     id: 9,
//     //     title: "Chorki",
//     //     releaseDate: "Mar 22, 2026",
//     //     posterPath: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop",
//     //     rating: 8.0,
//     //     language: "Bengali",
//     //     duration: "2h 5m",
//     //     genre: ["Drama", "Sports"],
//     //     votes: 1230
//     // },
//     // {
//     //     id: 10,
//     //     title: "Maya",
//     //     releaseDate: "Mar 23, 2026",
//     //     posterPath: "https://images.unsplash.com/photo-1534447677768-be436bb4a87c?q=80&w=1794&auto=format&fit=crop",
//     //     rating: 8.6,
//     //     language: "Bengali",
//     //     duration: "2h 20m",
//     //     genre: ["Mystery", "Thriller"],
//     //     isNew: true,
//     //     votes: 2890
//     // },
//     // {
//     //     id: 11,
//     //     title: "Poddoja",
//     //     releaseDate: "Mar 24, 2026",
//     //     posterPath: "https://images.unsplash.com/photo-1543536448-1a76fc6e4f25?q=80&w=2070&auto=format&fit=crop",
//     //     rating: 7.7,
//     //     language: "Bengali",
//     //     duration: "2h 15m",
//     //     genre: ["Drama", "Family"],
//     //     votes: 980
//     // },
//     // {
//     //     id: 12,
//     //     title: "Bishwoshundori",
//     //     releaseDate: "Mar 25, 2026",
//     //     posterPath: "https://images.unsplash.com/photo-1509347528160-9a47e3cd61b7?q=80&w=2070&auto=format&fit=crop",
//     //     rating: 8.5,
//     //     language: "Bengali",
//     //     duration: "2h 40m",
//     //     genre: ["Romance", "Comedy"],
//     //     votes: 4120
//     // }

//     {
//         id: 1,
//         title: "Haangor",
//         releaseDate: "Mar 19, 2026",
//         posterPath: "https://images.unsplash.com/photo-1534447677768-be436bb4a87c?q=80&w=1794&auto=format&fit=crop",
//         backdropPath: "https://images.unsplash.com/photo-1534447677768-be436bb4a87c?q=80&w=1794&auto=format&fit=crop",
//         rating: 8.4,
//         language: "Bengali",
//         duration: "2h 15m",
//         genre: ["Drama", "History"],
//         isNew: true,
//         votes: 2450,
//         certification: "MA 15+",
//         tagline: "A journey through time and memory",
//         overview: "Set against the backdrop of historical Bengal, Haangor tells the story of a fisherman's struggle against societal oppression and his quest for dignity in a changing world.",
//         director: {
//             name: "Tanvir Ahmed",
//             role: "Director"
//         },
//         writers: [
//             { name: "Tanvir Ahmed", role: "Screenplay" },
//             { name: "Humayun Ahmed", role: "Story" }
//         ],
//         cast: [
//             { name: "Chanchal Chowdhury", character: "Haangor", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
//             { name: "Jaya Ahsan", character: "Rohima", avatar: "https://images.unsplash.com/photo-1494790108777-385d4003c8b1?q=80&w=1887&auto=format&fit=crop" },
//             { name: "Fazlur Rahman", character: "Landlord", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop" }
//         ]
//     },
//     {
//         id: 2,
//         title: "Durban",
//         releaseDate: "Mar 19, 2026",
//         posterPath: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop",
//         backdropPath: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop",
//         rating: 7.9,
//         language: "Bengali",
//         duration: "2h 30m",
//         genre: ["Action", "Thriller"],
//         votes: 1890,
//         certification: "MA 15+",
//         tagline: "The city never sleeps. Neither does danger.",
//         overview: "A gritty action thriller set in the underbelly of Dhaka, where a former elite force operative must come out of retirement to rescue his kidnapped daughter from a powerful crime syndicate.",
//         director: {
//             name: "Ashiqur Rahman",
//             role: "Director"
//         },
//         writers: [
//             { name: "Ashiqur Rahman", role: "Screenplay" },
//             { name: "Shahidul Islam", role: "Story" }
//         ],
//         cast: [
//             { name: "Arifin Shuvoo", character: "Kazi", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
//             { name: "Puja Cherry", character: "Zara", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop" },
//             { name: "Iresh Zaker", character: "Villain", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop" }
//         ]
//     },
//     {
//         id: 3,
//         title: "Haangor",
//         releaseDate: "Mar 19, 2026",
//         posterPath: "https://images.unsplash.com/photo-1534447677768-be436bb4a87c?q=80&w=1794&auto=format&fit=crop",
//         backdropPath: "https://images.unsplash.com/photo-1534447677768-be436bb4a87c?q=80&w=1794&auto=format&fit=crop",
//         rating: 8.4,
//         language: "Bengali",
//         duration: "2h 15m",
//         genre: ["Drama", "History"],
//         isNew: true,
//         votes: 2450,
//         certification: "MA 15+",
//         tagline: "A journey through time and memory",
//         overview: "Set against the backdrop of historical Bengal, Haangor tells the story of a fisherman's struggle against societal oppression and his quest for dignity in a changing world.",
//         director: {
//             name: "Tanvir Ahmed",
//             role: "Director"
//         },
//         writers: [
//             { name: "Tanvir Ahmed", role: "Screenplay" },
//             { name: "Humayun Ahmed", role: "Story" }
//         ],
//         cast: [
//             { name: "Chanchal Chowdhury", character: "Haangor", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
//             { name: "Jaya Ahsan", character: "Rohima", avatar: "https://images.unsplash.com/photo-1494790108777-385d4003c8b1?q=80&w=1887&auto=format&fit=crop" },
//             { name: "Fazlur Rahman", character: "Landlord", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop" }
//         ]
//     },
//     {
//         id: 4,
//         title: "Durban",
//         releaseDate: "Mar 19, 2026",
//         posterPath: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop",
//         backdropPath: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop",
//         rating: 7.9,
//         language: "Bengali",
//         duration: "2h 30m",
//         genre: ["Action", "Thriller"],
//         votes: 1890,
//         certification: "MA 15+",
//         tagline: "The city never sleeps. Neither does danger.",
//         overview: "A gritty action thriller set in the underbelly of Dhaka, where a former elite force operative must come out of retirement to rescue his kidnapped daughter from a powerful crime syndicate.",
//         director: {
//             name: "Ashiqur Rahman",
//             role: "Director"
//         },
//         writers: [
//             { name: "Ashiqur Rahman", role: "Screenplay" },
//             { name: "Shahidul Islam", role: "Story" }
//         ],
//         cast: [
//             { name: "Arifin Shuvoo", character: "Kazi", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
//             { name: "Puja Cherry", character: "Zara", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop" },
//             { name: "Iresh Zaker", character: "Villain", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop" }
//         ]
//     },
// ];

// Genre options
const genres = [
    "Action", "Drama", "Comedy", "Thriller", "Horror",
    "Romance", "Crime", "History", "Biography", "Mystery",
    "Sports", "Family"
];

// Language options
const languages = ["Bengali", "Hindi", "English", "Tamil", "Telugu"];

// Sort options
const sortOptions = [
    { value: "popularity", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "title-asc", label: "Title (A-Z)" },
    { value: "title-desc", label: "Title (Z-A)" }
];

export default function PopularMoviesPage() {
    // State for filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [ratingRange, setRatingRange] = useState([0, 10]);
    const [yearRange, setYearRange] = useState([2020, 2026]);
    const [sortBy, setSortBy] = useState("popularity");
    const [showNewOnly, setShowNewOnly] = useState(false);
    const [favorites, setFavorites] = useState<number[]>([]);

    // Filter and sort movies
    const filteredMovies = movies
        .filter(movie => {
            // Search filter
            if (searchQuery && !movie.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            // Genre filter
            if (selectedGenres.length > 0 && !movie.genre.some(g => selectedGenres.includes(g))) {
                return false;
            }
            // Language filter
            if (selectedLanguages.length > 0 && !selectedLanguages.includes(movie.language)) {
                return false;
            }
            // Rating filter
            if (movie.rating < ratingRange[0] || movie.rating > ratingRange[1]) {
                return false;
            }
            // Year range filter
            const releaseYear = new Date(movie.releaseDate).getFullYear();
            if (releaseYear < yearRange[0] || releaseYear > yearRange[1]) {
                return false;
            }
            // New only filter
            if (showNewOnly && !movie.isNew) {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "rating":
                    return b.rating - a.rating;
                case "newest":
                    return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
                case "oldest":
                    return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
                case "title-asc":
                    return a.title.localeCompare(b.title);
                case "title-desc":
                    return b.title.localeCompare(a.title);
                default:
                    return b.votes - a.votes;
            }
        });

    const toggleFavorite = (id: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    const toggleGenre = (genre: string) => {
        setSelectedGenres(prev =>
            prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
        );
    };

    const toggleLanguage = (language: string) => {
        setSelectedLanguages(prev =>
            prev.includes(language) ? prev.filter(l => l !== language) : [...prev, language]
        );
    };

    const clearAllFilters = () => {
        setSearchQuery("");
        setSelectedGenres([]);
        setSelectedLanguages([]);
        setRatingRange([0, 10]);
        setYearRange([2020, 2026]);
        setShowNewOnly(false);
        setSortBy("popularity");
    };

    const activeFiltersCount =
        (searchQuery ? 1 : 0) +
        selectedGenres.length +
        selectedLanguages.length +
        (ratingRange[0] > 0 || ratingRange[1] < 10 ? 1 : 0) +
        (showNewOnly ? 1 : 0);

    return (
        <div className="min-h-screen bg-linear-to-b from-background to-muted/10">
            {/* Header */}
            <div className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Film className="size-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Popular Movies</h1>
                                <p className="text-sm text-muted-foreground">
                                    Showing {filteredMovies.length} movies
                                </p>
                            </div>
                        </div>

                        {/* Mobile Filter Button */}
                        <Sheet>
                            <SheetTrigger>
                                <Button variant="outline" className="lg:hidden relative">
                                    <Filter className="size-4 mr-2" />
                                    Filters
                                    {activeFiltersCount > 0 && (
                                        <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-full sm:w-100 overflow-y-auto">
                                <SheetHeader>
                                    <SheetTitle>Filters</SheetTitle>
                                </SheetHeader>
                                <FilterSidebar
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    selectedGenres={selectedGenres}
                                    toggleGenre={toggleGenre}
                                    selectedLanguages={selectedLanguages}
                                    toggleLanguage={toggleLanguage}
                                    ratingRange={ratingRange}
                                    setRatingRange={setRatingRange}
                                    yearRange={yearRange}
                                    setYearRange={setYearRange}
                                    showNewOnly={showNewOnly}
                                    setShowNewOnly={setShowNewOnly}
                                    clearAllFilters={clearAllFilters}
                                    genres={genres}
                                    languages={languages}
                                    activeFiltersCount={activeFiltersCount}
                                />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block w-80 shrink-0">
                        <div className="sticky top-24">
                            <FilterSidebar
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                selectedGenres={selectedGenres}
                                toggleGenre={toggleGenre}
                                selectedLanguages={selectedLanguages}
                                toggleLanguage={toggleLanguage}
                                ratingRange={ratingRange}
                                setRatingRange={setRatingRange}
                                yearRange={yearRange}
                                setYearRange={setYearRange}
                                showNewOnly={showNewOnly}
                                setShowNewOnly={setShowNewOnly}
                                clearAllFilters={clearAllFilters}
                                genres={genres}
                                languages={languages}
                                activeFiltersCount={activeFiltersCount}
                            />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Top Bar */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                            {/* <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search movies..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div> */}

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Select
                                    value={sortBy}
                                    onValueChange={(value) => setSortBy(value ?? "popularity")}
                                >
                                    <SelectTrigger className="w-full sm:w-45">
                                        <SlidersHorizontal className="size-4 mr-2" />
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sortOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Movies Grid */}
                        <AnimatePresence mode="wait">




                            {filteredMovies.length > 0 ? (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                >
                                    {filteredMovies.map((movie, index) => (
                                        <Link
                                            key={movie.id}
                                            href={`/movies/${movie.id}`}
                                            className="border rounded-lg overflow-hidden hover:shadow-lg transition"
                                        >
                                            <MovieCard
                                                key={movie.id}
                                                movie={movie}
                                                index={index}
                                                isFavorite={favorites.includes(movie.id)}
                                                onFavoriteToggle={(e) => toggleFavorite(movie.id, e)}
                                            />
                                        </Link>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-20"
                                >
                                    <div className="inline-flex p-4 bg-muted rounded-full mb-4">
                                        <Film className="size-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">No movies found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Try adjusting your filters to find what you are looking for.
                                    </p>
                                    <Button onClick={clearAllFilters} variant="outline">
                                        Clear all filters
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Load More Button */}
                        {filteredMovies.length > 0 && filteredMovies.length < movies.length && (
                            <div className="flex justify-center mt-10">
                                <Button variant="outline" className="px-8">
                                    Load More
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Filter Sidebar Component
interface FilterSidebarProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    selectedGenres: string[];
    toggleGenre: (genre: string) => void;
    selectedLanguages: string[];
    toggleLanguage: (language: string) => void;
    ratingRange: number[];
    setRatingRange: (value: number[]) => void;
    yearRange: number[];
    setYearRange: (value: number[]) => void;
    showNewOnly: boolean;
    setShowNewOnly: (value: boolean) => void;
    clearAllFilters: () => void;
    genres: string[];
    languages: string[];
    activeFiltersCount: number;
}

const FilterSidebar = ({
    searchQuery,
    setSearchQuery,
    selectedGenres,
    toggleGenre,
    selectedLanguages,
    toggleLanguage,
    ratingRange,
    setRatingRange,
    yearRange,
    setYearRange,
    showNewOnly,
    setShowNewOnly,
    clearAllFilters,
    genres,
    languages,
    activeFiltersCount
}: FilterSidebarProps) => {
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Filters</h3>
                {activeFiltersCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        Clear all
                    </Button>
                )}
            </div>

            {/* Search */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Movie title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Genres */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">Genres</Label>
                <div className="flex flex-wrap gap-2">
                    {genres.map(genre => (
                        <button
                            key={genre}
                            type="button"
                            className={cn(
                                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                selectedGenres.includes(genre)
                                    ? "bg-primary text-primary-foreground"
                                    : "border border-border/50 bg-background text-foreground hover:bg-primary/20"
                            )}
                            onClick={() => toggleGenre(genre)}
                        >
                            {genre}
                        </button>
                    ))}
                </div>
            </div>

            {/* Languages */}
            {/* <div className="space-y-3">
                <Label className="text-sm font-medium">Languages</Label>
                <div className="flex flex-wrap gap-2">
                    {languages.map(language => (
                        <Badge
                            key={language}
                            variant={selectedLanguages.includes(language) ? "default" : "outline"}
                            className={cn(
                                "cursor-pointer hover:bg-primary/20 transition-colors",
                                selectedLanguages.includes(language) && "bg-primary text-primary-foreground"
                            )}
                            onClick={() => toggleLanguage(language)}
                        >
                            {language}
                        </Badge>
                    ))}
                </div>
            </div> */}

            {/* Rating Range */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Rating</Label>
                    <span className="text-sm text-muted-foreground">
                        {ratingRange[0]} - {ratingRange[1]}
                    </span>
                </div>
                <Slider
                    value={ratingRange}
                    onValueChange={(value) =>
                        setRatingRange(Array.isArray(value) ? [...value] : [value, value])
                    }
                    max={10}
                    step={0.5}
                    className="py-4"
                />
            </div>

            {/* Year Range */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Release Year</Label>
                    <span className="text-sm text-muted-foreground">
                        {yearRange[0]} - {yearRange[1]}
                    </span>
                </div>
                <Slider
                    value={yearRange}
                    onValueChange={(value) =>
                        setYearRange(Array.isArray(value) ? [...value] : [value, value])
                    }
                    min={2000}
                    max={2026}
                    step={1}
                    className="py-4"
                />
            </div>

            {/* Additional Filters */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">Additional</Label>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="newOnly"
                        checked={showNewOnly}
                        onCheckedChange={(checked) => setShowNewOnly(checked as boolean)}
                    />
                    <label
                        htmlFor="newOnly"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        New releases only
                    </label>
                </div>
            </div>

            {/* Apply Button for Mobile */}
            <Button className="w-full lg:hidden mt-4">
                Apply Filters
            </Button>
        </div>
    );
};

// Movie Card Component
interface MovieCardProps {
    movie: Movie;
    index: number;
    isFavorite: boolean;
    onFavoriteToggle: (e: React.MouseEvent) => void;
}

const MovieCard = ({ movie, index, isFavorite, onFavoriteToggle }: MovieCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
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
                                    <div className="flex flex-wrap gap-1">
                                        {movie.genre.slice(0, 2).map(g => (
                                            <span key={g} className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white">
                                                {g}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                        <Calendar className="size-3" />
                                        <span>{movie.releaseDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                        <Clock className="size-3" />
                                        <span>{movie.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                        <Eye className="size-3" />
                                        <span>{movie.votes.toLocaleString()} views</span>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white text-sm font-medium transition-colors"
                                        >
                                            <span>View Details</span>
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Movie Info */}
                <div className="mt-3 px-1">
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
                    <div className="flex items-center gap-1 mt-1">
                        <Star className="size-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{movie.rating}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                            ({movie.votes.toLocaleString()})
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};