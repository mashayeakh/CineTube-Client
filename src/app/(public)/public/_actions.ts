"use server"

import { httpClient } from "@/lib/axios/httpClient"

export type MovieListItem = {
    id: string;
    title: string;
    description?: string;
    genres?: Array<{ id: string; name: string }>;
    releaseYear?: number;
    createdAt?: string;
    poster?: string;
    type?: 'movie' | 'contribution';
}

export const getMovies = async (): Promise<MovieListItem[]> => {
    const res = await httpClient.get<any>("/movies")
    const payload = res.result ?? res.data ?? res
    return Array.isArray(payload) ? payload : []
}

