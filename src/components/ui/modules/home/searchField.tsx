"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, History, TrendingUp, Film, Tv, Users, Star, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SearchFieldProps {
    className?: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
    variant?: 'default' | 'minimal' | 'expanded';
    suggestions?: string[];
    recentSearches?: string[];
    popularSearches?: string[];
}

export default function SearchField({
    className,
    placeholder = "Search for movies, TV shows, people...",
    onSearch,
    variant = 'default',
    suggestions = [],
    recentSearches = [],
    popularSearches = ["Dune", "Oppenheimer", "The Bear", "Succession", "Barbie"]
}: SearchFieldProps) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [recent, setRecent] = useState<string[]>(recentSearches);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        // Add to recent searches
        setRecent(prev => {
            const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 5);
            return updated;
        });

        // Call onSearch callback if provided
        if (onSearch) {
            onSearch(searchQuery);
        } else {
            // Default behavior: navigate to search page
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }

        setShowSuggestions(false);
        setIsFocused(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    const clearSearch = () => {
        setQuery('');
        inputRef.current?.focus();
    };

    const removeRecent = (item: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setRecent(prev => prev.filter(s => s !== item));
    };

    // Variant styles
    const getContainerStyles = () => {
        switch (variant) {
            case 'minimal':
                return 'bg-transparent border-b border-border hover:border-primary focus-within:border-primary';
            case 'expanded':
                return 'bg-muted/50 border-2 border-border focus-within:border-primary shadow-lg';
            default:
                return 'bg-muted/30 border border-border hover:border-primary/50 focus-within:border-primary';
        }
    };

    return (
        <div className={cn("relative", className)}>
            <form
                onSubmit={handleSubmit}
                className={cn(
                    "flex items-center gap-8 px-4 py-2.5  transition-all duration-300",
                    getContainerStyles(),
                    isFocused && "ring-2 ring-primary/20"
                )}
            >
                <Search className={cn(
                    "size-5 transition-colors duration-300 ml-8",
                    isFocused ? "text-primary" : "text-muted-foreground"
                )} />

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        setIsFocused(true);
                        setShowSuggestions(true);
                    }}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60 text-sm"
                />

                <AnimatePresence>
                    {query && (
                        <motion.button
                            type="button"
                            onClick={clearSearch}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="p-1 hover:bg-muted rounded-full transition-colors"
                        >
                            <X className="size-4 text-muted-foreground hover:text-foreground" />
                        </motion.button>
                    )}
                </AnimatePresence>

                <Button
                    type="submit"
                    size="sm"
                    className="rounded-full px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300"
                >
                    Search
                </Button>
            </form>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
                {showSuggestions && (recent.length > 0 || popularSearches.length > 0) && (
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden z-50"
                    >
                        {/* Recent Searches */}
                        {recent.length > 0 && (
                            <div className="p-3 border-b border-border/50">
                                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground">
                                    <History className="size-3" />
                                    Recent Searches
                                </div>
                                <div className="space-y-1">
                                    {recent.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group flex items-center justify-between px-3 py-2 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                                            onClick={() => handleSearch(item)}
                                        >
                                            <span className="text-sm">{item}</span>
                                            <button
                                                onClick={(e) => removeRecent(item, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background rounded-full transition-all"
                                            >
                                                <X className="size-3 text-muted-foreground" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Popular Searches */}
                        <div className="p-3">
                            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground">
                                <TrendingUp className="size-3" />
                                Popular Searches
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {popularSearches.map((item, index) => (
                                    <motion.button
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        onClick={() => handleSearch(item)}
                                        className="px-4 py-2 bg-muted/50 hover:bg-muted rounded-full text-sm transition-colors"
                                    >
                                        {item}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Categories */}
                        <div className="p-3 bg-muted/30 border-t border-border/50">
                            <div className="grid grid-cols-2 gap-2">
                                <QuickCategory icon={<Film className="size-4" />} label="Movies" />
                                <QuickCategory icon={<Tv className="size-4" />} label="TV Shows" />
                                <QuickCategory icon={<Users className="size-4" />} label="People" />
                                <QuickCategory icon={<Star className="size-4" />} label="Top Rated" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Quick Category Component
const QuickCategory = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-3 py-2 bg-background hover:bg-muted rounded-lg text-sm transition-colors"
    >
        <span className="text-primary">{icon}</span>
        <span>{label}</span>
    </motion.button>
);

// Preset Search Variants
export const HeroSearchField = () => (
    <SearchField
        variant="expanded"
        placeholder="Search millions of movies, TV shows, and people..."
        className="max-w-2xl mx-auto"
    />
);

export const MinimalSearchField = () => (
    <SearchField
        variant="minimal"
        placeholder="Search..."
        className="w-64"
    />
);