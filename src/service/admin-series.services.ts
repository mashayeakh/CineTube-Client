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

export type SeriesPayload = {
    title: string;
    description: string;
    poster: string;
    releaseYear: number;
    director: string;
    streamingLink?: string;
    cast: string[];
    genres: string[];
    platforms: string[];
    priceType: string;
    ageGroup: string;
    userId: string;
};

export async function getAdminSeries(options?: ApiRequestOptions) {
    const response = await httpClient.get<unknown>("/series", options);
    return unwrap(response);
}

export async function getAllAdminSeries(options?: ApiRequestOptions) {
    const response = await httpClient.get<unknown>("/series", options);
    return unwrap(response);
}

export async function getFeaturedAdminSeries(options?: ApiRequestOptions) {
    const response = await httpClient.get<unknown>("/series/featured", options);
    return unwrap(response);
}

export async function getOngoingAdminSeries(options?: ApiRequestOptions) {
    const response = await httpClient.get<unknown>("/series/ongoing", options);
    return unwrap(response);
}

export async function getCompletedAdminSeries(options?: ApiRequestOptions) {
    const response = await httpClient.get<unknown>("/series/completed", options);
    return unwrap(response);
}

export async function getUpcomingAdminSeries(options?: ApiRequestOptions) {
    const response = await httpClient.get<unknown>("/series/upcoming", options);
    return unwrap(response);
}

export async function getMySeriesTracking(options?: ApiRequestOptions) {
    const response = await httpClient.get<unknown>("/series/tracking/me", options);
    return unwrap(response);
}

export async function searchAdminSeries(searchTerm: string, options?: ApiRequestOptions) {
    const response = await httpClient.get<unknown>("/series/search", {
        ...options,
        params: {
            ...(options?.params ?? {}),
            searchTerm,
        },
    });

    return unwrap(response);
}

export async function createAdminSeries(payload: SeriesPayload | FormData) {
    const response = await httpClient.post<unknown>("/series/create", payload);
    return unwrap(response);
}

export async function updateAdminSeries(seriesId: string, payload: Partial<SeriesPayload>) {
    const response = await httpClient.patch<unknown>(`/series/${seriesId}`, payload);
    return unwrap(response);
}

export async function deleteAdminSeries(seriesId: string) {
    const response = await httpClient.delete<unknown>(`/series/${seriesId}`);
    return unwrap(response);
}

export async function deleteAllAdminSeries() {
    const response = await httpClient.delete<unknown>("/series");
    return unwrap(response);
}

export async function featureAdminSeries(seriesId: string) {
    const response = await httpClient.patch<unknown>(`/series/${seriesId}/feature`, {});
    return unwrap(response);
}

export function toSeriesPayload(input: UnknownRecord): Partial<SeriesPayload> {
    return input as Partial<SeriesPayload>;
}
