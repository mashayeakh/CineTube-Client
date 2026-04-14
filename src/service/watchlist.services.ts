// import { httpClient, type ApiRequestOptions } from "@/lib/axios/httpClient";

// type ApiEnvelope<TData> = {
//     result?: TData;
//     data?: TData;
//     message?: string;
// };

// function unwrap<TData>(response: ApiEnvelope<TData> | TData) {
//     if (typeof response === "object" && response !== null && !Array.isArray(response)) {
//         const envelope = response as ApiEnvelope<TData>;

//         return {
//             data: (envelope.result ?? envelope.data ?? response) as TData,
//             message: envelope.message ?? "Request completed",
//         };
//     }

//     return {
//         data: response as TData,
//         message: "Request completed",
//     };
// }

// export async function getMyWatchlists(options?: ApiRequestOptions) {
//     const response = await httpClient.get<unknown>("/watchlists", options);
//     const unwrapped = unwrap(response);

//     return {
//         ...unwrapped,
//         data: Array.isArray(unwrapped.data) ? unwrapped.data : [],
//     };
// }

// //! for movie
// export async function createMovieWatchlist(movieId: string) {
//     const response = await httpClient.post<unknown>("/watchlists/movie", { movieId });
//     return unwrap(response);
// }
// //! for series
// export async function createSeriesWatchlist(seriesId: string) {
//     const response = await httpClient.post<unknown>("/watchlists/series", { seriesId });
//     return unwrap(response);
// }

// export async function deleteWatchlist(watchlistId: string) {
//     const response = await httpClient.delete<unknown>(`/watchlists/${watchlistId}`);
//     return unwrap(response);
// }



import { httpClient, type ApiRequestOptions } from "@/lib/axios/httpClient";

type ApiEnvelope<TData> = {
    result?: TData;
    data?: TData;
    message?: string;
};

function unwrap<TData>(response: ApiEnvelope<TData> | TData) {
    if (typeof response === "object" && response !== null && !Array.isArray(response)) {
        const envelope = response as ApiEnvelope<TData>;

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

//! get movie watchlist → GET /watchlists/movies/all
export async function getMyWatchlists(options?: ApiRequestOptions) {
    const response = await httpClient.get<unknown>("/watchlists/movies/all", options);
    const unwrapped = unwrap(response);

    return {
        ...unwrapped,
        data: Array.isArray(unwrapped.data) ? unwrapped.data : [],
    };
}

//! get series watchlist → GET /watchlists/series/all
export async function getMySeriesWatchlists(options?: ApiRequestOptions) {
    const response = await httpClient.get<unknown>("/watchlists/series/all", options);
    const unwrapped = unwrap(response);

    return {
        ...unwrapped,
        data: Array.isArray(unwrapped.data) ? unwrapped.data : [],
    };
}

//! for movie
export async function createMovieWatchlist(movieId: string) {
    const response = await httpClient.post<unknown>("/watchlists/movie", { movieId });
    return unwrap(response);
}

//! for series
export async function createSeriesWatchlist(seriesId: string) {
    const response = await httpClient.post<unknown>("/watchlists/series", { seriesId });
    return unwrap(response);
}

export async function deleteWatchlist(watchlistId: string) {
    const response = await httpClient.delete<unknown>(`/watchlists/${watchlistId}`);
    return unwrap(response);
}