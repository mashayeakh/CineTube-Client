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

export type MovieCatalogPayload = {
    movies?: unknown[];
    contributions?: unknown[];
};

export type TopRatedMoviesPayload = unknown[];

function resolveCatalogBaseUrls() {
    const envBase =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        process.env.NEXT_PUBLIC_API_URL;

    const candidates = [
        envBase,
        "http://localhost:5000/api/v1",
        "http://localhost:5000",
    ]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.replace(/\/$/, ""));

    return Array.from(new Set(candidates));
}

async function directFetchCatalog(options?: ApiRequestOptions) {
    const bases = resolveCatalogBaseUrls();
    const paths = ["/movies/all-with-contributions", "/api/v1/movies/all-with-contributions"];

    for (const base of bases) {
        for (const path of paths) {
            const url = `${base}${path}`;

            try {
                const response = await fetch(url, {
                    method: "GET",
                    cache: "no-store",
                    headers: options?.headers,
                });

                if (!response.ok) {
                    continue;
                }

                const payload = (await response.json()) as UnknownRecord;
                return unwrap(payload);
            } catch {
                continue;
            }
        }
    }

    throw new Error("Unable to fetch movies with contributions from any configured base URL.");
}

export async function getMoviesWithContributions(options?: ApiRequestOptions) {
    try {
        const response = await httpClient.get<UnknownRecord | MovieCatalogPayload>("/movies/all-with-contributions", options);
        return unwrap(response);
    } catch {
        try {
            const fallbackResponse = await httpClient.get<UnknownRecord | MovieCatalogPayload>("/api/v1/movies/all-with-contributions", options);
            return unwrap(fallbackResponse);
        } catch {
            return directFetchCatalog(options);
        }
    }
}

async function directFetchTopRatedMovies(options?: ApiRequestOptions) {
    const bases = resolveCatalogBaseUrls();
    const paths = ["/movies/top-rated", "/api/v1/movies/top-rated"];

    for (const base of bases) {
        for (const path of paths) {
            const url = `${base}${path}`;

            try {
                const response = await fetch(url, {
                    method: "GET",
                    cache: "no-store",
                    headers: options?.headers,
                });

                if (!response.ok) {
                    continue;
                }

                const payload = (await response.json()) as UnknownRecord;
                return unwrap(payload);
            } catch {
                continue;
            }
        }
    }

    throw new Error("Unable to fetch top-rated movies from any configured base URL.");
}

export async function getTopRatedMovies(options?: ApiRequestOptions) {
    try {
        const response = await httpClient.get<UnknownRecord | TopRatedMoviesPayload>("/movies/top-rated", options);
        return unwrap(response);
    } catch {
        try {
            const fallbackResponse = await httpClient.get<UnknownRecord | TopRatedMoviesPayload>("/api/v1/movies/top-rated", options);
            return unwrap(fallbackResponse);
        } catch {
            return directFetchTopRatedMovies(options);
        }
    }
}