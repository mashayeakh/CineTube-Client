/* eslint-disable @typescript-eslint/no-explicit-any */
import { Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import MovieDetailsClient from './MovieDetailsClient';
import { getMovieById } from '../_actions/movie';

function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Film className="size-16 mx-auto mb-4 text-muted-foreground" />
                <h1 className="text-2xl font-bold mb-2">Movie Not Found</h1>
                <p className="text-muted-foreground mb-4">The movie you are looking for does not exist.</p>
                <Button>
                    <Link href="/popular">Browse Movies</Link>
                </Button>
            </div>
        </div>
    );
}

export default async function MovieDetails({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    let data: any;
    try {
        data = await getMovieById(id);
    } catch {
        return <NotFound />;
    }

    if (!data) return <NotFound />;

    // Parse cast from JSON string if needed
    let castArray: { name: string; character: string }[] = [];
    try {
        const parsed = JSON.parse(data.cast ?? '[]');
        if (Array.isArray(parsed)) {
            castArray = parsed.map((name: string) => ({ name, character: '' }));
        }
    } catch {
        castArray = [];
    }

    const approvedReviews = (data.reviews ?? []).filter((r: any) => r.status === 'APPROVED');
    const avgRating =
        approvedReviews.length > 0
            ? Number(
                (
                    approvedReviews.reduce((sum: number, r: any) => sum + Number(r.rating ?? 0), 0) /
                    approvedReviews.length
                ).toFixed(1)
            )
            : 0;

    // Parse tags for each review
    const mappedReviews = (data.reviews ?? []).map((r: any) => {
        let tags: string[] = [];
        try {
            const parsed = JSON.parse(r.tags ?? '[]');
            if (Array.isArray(parsed)) tags = parsed;
        } catch { tags = []; }
        return {
            id: r.id as string,
            userId: r.userId as string,
            rating: Number(r.rating ?? 0),
            content: (r.content as string) ?? '',
            isSpoiler: Boolean(r.isSpoiler),
            tags,
            status: (r.status as string) ?? '',
            createdAt: (r.createdAt as string) ?? '',
            comments: (r.comments ?? []).map((c: any) => ({
                id: c.id as string,
                userId: c.userId as string,
                content: (c.content as string) ?? '',
                isSpoiler: Boolean(c.isSpoiler),
                createdAt: (c.createdAt as string) ?? '',
            })),
        };
    });

    const movie = {
        id: data.id as string,
        title: data.title as string,
        releaseDate: data.releaseYear ? `${data.releaseYear}-01-01` : new Date().toISOString(),
        posterPath: (data.poster as string) || 'https://images.unsplash.com/photo-1534809027769-b00d750a2883',
        backdropPath: (data.poster as string) || undefined,
        rating: avgRating,
        language: 'English',
        // duration: 'N/A',
        genre: [] as string[],
        votes: approvedReviews.length,
        overview: (data.description as string) ?? '',
        ageGroup: (data.ageGroup as string) ?? undefined,
        priceType: (data.priceType as string) ?? undefined,
        director: data.director ? { name: data.director as string, role: 'Director' } : undefined,
        cast: castArray,
        reviews: mappedReviews,
    };

    return <MovieDetailsClient movie={movie} />;
}

