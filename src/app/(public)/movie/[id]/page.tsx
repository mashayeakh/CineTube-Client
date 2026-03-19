/* eslint-disable @next/next/no-async-client-component */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */

import { Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { movies } from '@/app/data/movies';
import MovieDetailsClient from './MovieDetailsClient';

// Movie interface based on your requirements
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

// Complete movie database with all details
// const moviesDatabase: Record<string, Movie> = {
//     "1": {
//         id: 1,
//         title: "War Machine",
//         releaseDate: "2026-03-19",
//         posterPath: "https://images.unsplash.com/photo-1534447677768-be436bb4a87c?q=80&w=1794&auto=format&fit=crop",
//         backdropPath: "https://images.unsplash.com/photo-1534447677768-be436bb4a87c?q=80&w=1794&auto=format&fit=crop",
//         rating: 8.4,
//         language: "English",
//         duration: "1h 50m",
//         genre: ["Action", "Science Fiction", "Thriller"],
//         isNew: true,
//         votes: 2450,
//         certification: "MA 15+",
//         tagline: "All grit. No quit.",
//         overview: "On one last grueling mission during Army Ranger training, a combat engineer must lead his unit in a fight against a giant otherworldly killing machine.",
//         director: {
//             name: "Patrick Hughes",
//             role: "Director, Screenplay, Story"
//         },
//         writers: [
//             { name: "James Beaufort", role: "Screenplay" }
//         ],
//         cast: [
//             { name: "Chanchal Chowdhury", character: "Haangor", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
//             { name: "Jaya Ahsan", character: "Rohima", avatar: "https://images.unsplash.com/photo-1494790108777-385d4003c8b1?q=80&w=1887&auto=format&fit=crop" },
//             { name: "Fazlur Rahman", character: "Landlord", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop" }
//         ]
//     },
//     "2": {
//         id: 2,
//         title: "Haangor",
//         releaseDate: "2026-03-19",
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
//     "3": {
//         id: 3,
//         title: "Durban",
//         releaseDate: "2026-03-19",
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
//     "4": {
//         id: 4,
//         title: "Bonolota Express",
//         releaseDate: "2026-03-21",
//         posterPath: "https://images.unsplash.com/photo-1543536448-1a76fc6e4f25?q=80&w=2070&auto=format&fit=crop",
//         backdropPath: "https://images.unsplash.com/photo-1543536448-1a76fc6e4f25?q=80&w=2070&auto=format&fit=crop",
//         rating: 8.2,
//         language: "Bengali",
//         duration: "2h 45m",
//         genre: ["Romance", "Drama"],
//         isNew: true,
//         votes: 3120,
//         certification: "PG-13",
//         tagline: "Love knows no boundaries",
//         overview: "A heartwarming tale of two strangers who meet on a train journey across Bengal and discover that sometimes the most beautiful destinations are the people we meet along the way.",
//         director: {
//             name: "Mostofa Sarwar Farooki",
//             role: "Director"
//         },
//         writers: [
//             { name: "Mostofa Sarwar Farooki", role: "Screenplay" },
//             { name: "Anisul Hoque", role: "Story" }
//         ],
//         cast: [
//             { name: "Tahsan Rahman Khan", character: "Arko", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
//             { name: "Mim Mantasha", character: "Bonolota", avatar: "https://images.unsplash.com/photo-1494790108777-385d4003c8b1?q=80&w=1887&auto=format&fit=crop" }
//         ]
//     },
//     "5": {
//         id: 5,
//         title: "Maalik",
//         releaseDate: "2026-03-19",
//         posterPath: "https://images.unsplash.com/photo-1509347528160-9a47e3cd61b7?q=80&w=2070&auto=format&fit=crop",
//         backdropPath: "https://images.unsplash.com/photo-1509347528160-9a47e3cd61b7?q=80&w=2070&auto=format&fit=crop",
//         rating: 8.7,
//         language: "Bengali",
//         duration: "2h 20m",
//         genre: ["Crime", "Drama"],
//         votes: 4230,
//         certification: "R",
//         tagline: "Power comes with a price",
//         overview: "In the criminal underworld of old Dhaka, a young man rises through the ranks to become the most feared don, but soon discovers that being the 'Maalik' (boss) comes at a tremendous personal cost.",
//         director: {
//             name: "Amitabh Reza",
//             role: "Director"
//         },
//         writers: [
//             { name: "Amitabh Reza", role: "Screenplay" },
//             { name: "Sharfuddin Ahmed", role: "Story" }
//         ],
//         cast: [
//             { name: "Shakib Khan", character: "Maalik", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
//             { name: "Apurba", character: "Rival", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop" }
//         ]
//     },
//     "6": {
//         id: 6,
//         title: "Prince: Once Upon a Time in Dhaka",
//         releaseDate: "2026-03-21",
//         posterPath: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop",
//         backdropPath: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop",
//         rating: 8.9,
//         language: "Bengali",
//         duration: "2h 50m",
//         genre: ["Biography", "Drama"],
//         isNew: true,
//         votes: 5670,
//         certification: "MA 15+",
//         tagline: "Every city has a legend",
//         overview: "The biographical drama tells the story of a legendary figure from Dhaka's underground music scene who became an icon for a generation, battling personal demons while creating timeless art.",
//         director: {
//             name: "Rubaiyat Hossain",
//             role: "Director"
//         },
//         writers: [
//             { name: "Rubaiyat Hossain", role: "Screenplay" }
//         ],
//         cast: [
//             { name: "Tahsan Rahman Khan", character: "Prince", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
//             { name: "Nusrat Imrose Tisha", character: "Maya", avatar: "https://images.unsplash.com/photo-1494790108777-385d4003c8b1?q=80&w=1887&auto=format&fit=crop" }
//         ]
//     }
// };

// Server Component for initial data fetch
export default async function MovieDetails({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const movie = movies[Number(id)];

    if (!movie) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Film className="size-16 mx-auto mb-4 text-muted-foreground" />
                    <h1 className="text-2xl font-bold mb-2">Movie Not Found</h1>
                    <p className="text-muted-foreground mb-4">The movie you are looking for doesn not exist.</p>
                    <Button >
                        <Link href="/popular">Browse Movies</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return <MovieDetailsClient movie={movie} />;
}

