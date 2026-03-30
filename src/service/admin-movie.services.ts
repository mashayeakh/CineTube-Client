import { httpClient, type ApiRequestOptions } from "@/lib/axios/httpClient";

type UnknownRecord = Record<string, unknown>;

type ApiLikeResponse<TData> = {
    result?: TData;
    data?: TData;
    message?: string;
};

function unwrap<TData>(response: ApiLikeResponse<TData> | TData) {
    if (typeof response === "object" && response !== null && !Array.isArray(response)) {
        const envelope = response as ApiLikeResponse<TData>;

        return {
            data: (envelope.result ?? envelope.data ?? response) as TData,
            message: envelope.message ?? "Request completed",
        };
    }

    return {
        data: response as TData,
        message: "Request completed",
    };
}

export type MoviePayload = {
    title: string;
    description: string;
    poster: string;
    releaseYear: number;
    director: string;
    cast: string[];
    genres: string[];
    platforms: string[];
    priceType: string;
    ageGroup: string;
    userId: string;
};

export async function getAdminMovies(options?: ApiRequestOptions) {
    const response = await httpClient.get<unknown>("/movies", options);
    return unwrap(response);
}

export async function createAdminMovie(payload: MoviePayload) {
    const response = await httpClient.post<unknown>("/movies/create", payload);
    return unwrap(response);
}

export async function updateAdminMovie(movieId: string, payload: Partial<MoviePayload>) {
    const response = await httpClient.patch<unknown>(`/movies/${movieId}`, payload);
    return unwrap(response);
}

export async function deleteAdminMovie(movieId: string) {
    const response = await httpClient.delete<unknown>(`/movies/${movieId}`);
    return unwrap(response);
}

export async function deleteAllAdminMovies() {
    const response = await httpClient.delete<unknown>("/movies");
    return unwrap(response);
}

export function toMoviePayload(input: UnknownRecord): Partial<MoviePayload> {
    return input as Partial<MoviePayload>;
}
