import { Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { movies } from '@/app/data/movies';
import MovieDetailsClient from './MovieDetailsClient';


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

