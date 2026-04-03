import { httpClient } from "@/lib/axios/httpClient";

const GENRE_ENDPOINTS = ["/genres", "/admin/genres", "/admin/dashboard/genres"];
const PLATFORM_ENDPOINTS = [
    "/streaming-platforms",
    "/platforms",
    "/admin/streaming-platforms",
    "/admin/dashboard/streaming-platforms",
    "/admin/dashboard/platforms",
];

async function tryGet<T>(endpoints: string[]): Promise<T> {
    let lastError: unknown = null;

    for (const endpoint of endpoints) {
        try {
            const response = await httpClient.get<T>(endpoint);
            return (response?.result ?? response?.data ?? response ?? []) as T;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError;
}

async function tryPost<T>(endpoints: string[], payload: Record<string, unknown>): Promise<T> {
    let lastError: unknown = null;

    for (const endpoint of endpoints) {
        try {
            const response = await httpClient.post<T>(endpoint, payload);
            return (response?.result ?? response?.data ?? response) as T;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError;
}

async function tryPatch<T>(endpoints: string[], id: string, payload: Record<string, unknown>): Promise<T> {
    let lastError: unknown = null;

    for (const endpoint of endpoints) {
        try {
            const response = await httpClient.patch<T>(`${endpoint}/${id}`, payload);
            return (response?.result ?? response?.data ?? response) as T;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError;
}

async function tryPatchOrPost<T>(endpoints: string[], id: string, payload: Record<string, unknown>): Promise<T> {
    let lastError: unknown = null;

    for (const endpoint of endpoints) {
        try {
            const response = await httpClient.patch<T>(`${endpoint}/${id}`, payload);
            return (response?.result ?? response?.data ?? response) as T;
        } catch (patchError) {
            lastError = patchError;

            try {
                const fallbackResponse = await httpClient.post<T>(`${endpoint}/${id}`, payload);
                return (fallbackResponse?.result ?? fallbackResponse?.data ?? fallbackResponse) as T;
            } catch (postError) {
                lastError = postError;
            }
        }
    }

    throw lastError;
}

async function tryDelete<T>(endpoints: string[], id: string): Promise<T> {
    let lastError: unknown = null;

    for (const endpoint of endpoints) {
        try {
            const response = await httpClient.delete<T>(`${endpoint}/${id}`);
            return (response?.result ?? response?.data ?? response) as T;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError;
}

export async function getAdminGenres() {
    return tryGet<unknown[]>(GENRE_ENDPOINTS);
}

export async function createAdminGenre(payload: { name: string; slug?: string; isActive?: boolean }) {
    return tryPost<unknown>(GENRE_ENDPOINTS, payload);
}

export async function updateAdminGenre(id: string, payload: { name?: string; slug?: string; isActive?: boolean }) {
    return tryPatch<unknown>(GENRE_ENDPOINTS, id, payload);
}

export async function deleteAdminGenre(id: string) {
    return tryDelete<unknown>(GENRE_ENDPOINTS, id);
}

export async function getAdminStreamingPlatforms() {
    return tryGet<unknown[]>(PLATFORM_ENDPOINTS);
}

export async function createAdminStreamingPlatform(payload: { name: string }) {
    return tryPost<unknown>(PLATFORM_ENDPOINTS, payload);
}

export async function updateAdminStreamingPlatform(id: string, payload: { name?: string }) {
    return tryPatchOrPost<unknown>(PLATFORM_ENDPOINTS, id, payload);
}

export async function deleteAdminStreamingPlatform(id: string) {
    return tryDelete<unknown>(PLATFORM_ENDPOINTS, id);
}
