export interface Movie {
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

export const movies: Movie[] = [
    {
        id: 1,
        title: "Haangor",
        releaseDate: "Mar 19, 2026",
        posterPath: "https://images.unsplash.com/photo-1534447677768-be436bb4a87c?q=80&w=1794&auto=format&fit=crop",
        backdropPath: "https://images.unsplash.com/photo-1534447677768-be436bb4a87c?q=80&w=1794&auto=format&fit=crop",
        rating: 8.4,
        language: "Bengali",
        duration: "2h 15m",
        genre: ["Drama", "History"],
        isNew: true,
        votes: 2450,
        certification: "MA 15+",
        tagline: "A journey through time and memory",
        overview: "Set against the backdrop of historical Bengal, Haangor tells the story of a fisherman's struggle against societal oppression and his quest for dignity in a changing world.",
        director: {
            name: "Tanvir Ahmed",
            role: "Director"
        },
        writers: [
            { name: "Tanvir Ahmed", role: "Screenplay" },
            { name: "Humayun Ahmed", role: "Story" }
        ],
        cast: [
            { name: "Chanchal Chowdhury", character: "Haangor", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
            { name: "Jaya Ahsan", character: "Rohima", avatar: "https://images.unsplash.com/photo-1494790108777-385d4003c8b1?q=80&w=1887&auto=format&fit=crop" },
            { name: "Fazlur Rahman", character: "Landlord", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop" }
        ]
    },
    {
        id: 2,
        title: "Durban",
        releaseDate: "Mar 19, 2026",
        posterPath: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop",
        backdropPath: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop",
        rating: 7.9,
        language: "Bengali",
        duration: "2h 30m",
        genre: ["Action", "Thriller"],
        votes: 1890,
        certification: "MA 15+",
        tagline: "The city never sleeps. Neither does danger.",
        overview: "A gritty action thriller set in the underbelly of Dhaka, where a former elite force operative must come out of retirement to rescue his kidnapped daughter from a powerful crime syndicate.",
        director: {
            name: "Ashiqur Rahman",
            role: "Director"
        },
        writers: [
            { name: "Ashiqur Rahman", role: "Screenplay" },
            { name: "Shahidul Islam", role: "Story" }
        ],
        cast: [
            { name: "Arifin Shuvoo", character: "Kazi", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
            { name: "Puja Cherry", character: "Zara", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop" },
            { name: "Iresh Zaker", character: "Villain", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop" }
        ]
    },
    {
        id: 3,
        title: "Haangor",
        releaseDate: "Mar 19, 2026",
        posterPath: "https://images.unsplash.com/photo-1534447677768-be436bb4a87c?q=80&w=1794&auto=format&fit=crop",
        backdropPath: "https://images.unsplash.com/photo-1534447677768-be436bb4a87c?q=80&w=1794&auto=format&fit=crop",
        rating: 8.4,
        language: "Bengali",
        duration: "2h 15m",
        genre: ["Drama", "History"],
        isNew: true,
        votes: 2450,
        certification: "MA 15+",
        tagline: "A journey through time and memory",
        overview: "Set against the backdrop of historical Bengal, Haangor tells the story of a fisherman's struggle against societal oppression and his quest for dignity in a changing world.",
        director: {
            name: "Tanvir Ahmed",
            role: "Director"
        },
        writers: [
            { name: "Tanvir Ahmed", role: "Screenplay" },
            { name: "Humayun Ahmed", role: "Story" }
        ],
        cast: [
            { name: "Chanchal Chowdhury", character: "Haangor", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
            { name: "Jaya Ahsan", character: "Rohima", avatar: "https://images.unsplash.com/photo-1494790108777-385d4003c8b1?q=80&w=1887&auto=format&fit=crop" },
            { name: "Fazlur Rahman", character: "Landlord", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop" }
        ]
    },
    {
        id: 4,
        title: "Durban",
        releaseDate: "Mar 19, 2026",
        posterPath: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop",
        backdropPath: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop",
        rating: 7.9,
        language: "Bengali",
        duration: "2h 30m",
        genre: ["Action", "Thriller"],
        votes: 1890,
        certification: "MA 15+",
        tagline: "The city never sleeps. Neither does danger.",
        overview: "A gritty action thriller set in the underbelly of Dhaka, where a former elite force operative must come out of retirement to rescue his kidnapped daughter from a powerful crime syndicate.",
        director: {
            name: "Ashiqur Rahman",
            role: "Director"
        },
        writers: [
            { name: "Ashiqur Rahman", role: "Screenplay" },
            { name: "Shahidul Islam", role: "Story" }
        ],
        cast: [
            { name: "Arifin Shuvoo", character: "Kazi", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
            { name: "Puja Cherry", character: "Zara", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop" },
            { name: "Iresh Zaker", character: "Villain", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop" }
        ]
    },
];