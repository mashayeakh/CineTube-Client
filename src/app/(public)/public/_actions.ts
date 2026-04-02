import { httpClient } from "@/lib/axios/httpClient"

export type MovieListItem = {
    id: string;
    title: string;
    description?: string;
}

export const getMovies = async (): Promise<MovieListItem[]> => {
    const allMovies = await httpClient.get<MovieListItem[]>("/movies")
    const payload = allMovies.result ?? allMovies.data
    return Array.isArray(payload) ? payload : []
}

