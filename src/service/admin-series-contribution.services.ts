import { httpClient } from "@/lib/axios/httpClient";

const CONTRIBUTION_LIST_ENDPOINTS = [
    "/series-contributions/all",
    "/series-contributions",
    "/admin/series-contributions/all",
    "/admin/series-contributions",
];

const APPROVE_ENDPOINTS = [
    "/admin/approve-series-contribution",
    "/approve-series-contribution",
    "/admin/series-contributions",
];

const REJECT_ENDPOINTS = [
    "/admin/reject-series-contribution",
    "/reject-series-contribution",
    "/admin/series-contributions",
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

async function tryApprove<T>(contributionId: string): Promise<T> {
    let lastError: unknown = null;

    for (const endpoint of APPROVE_ENDPOINTS) {
        try {
            if (endpoint.includes("series-contributions")) {
                const response = await httpClient.patch<T>(`${endpoint}/${contributionId}/approve`, {});
                return (response?.result ?? response?.data ?? response) as T;
            }

            const response = await httpClient.post<T>(`${endpoint}/${contributionId}`, {});
            return (response?.result ?? response?.data ?? response) as T;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError;
}

async function tryReject<T>(contributionId: string): Promise<T> {
    let lastError: unknown = null;

    for (const endpoint of REJECT_ENDPOINTS) {
        try {
            if (endpoint.includes("series-contributions")) {
                const response = await httpClient.patch<T>(`${endpoint}/${contributionId}/reject`, {});
                return (response?.result ?? response?.data ?? response) as T;
            }

            const response = await httpClient.post<T>(`${endpoint}/${contributionId}`, {});
            return (response?.result ?? response?.data ?? response) as T;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError;
}

export async function getAdminSeriesContributions() {
    return tryGet<unknown[]>(CONTRIBUTION_LIST_ENDPOINTS);
}

export async function approveSeriesContribution(contributionId: string) {
    return tryApprove<unknown>(contributionId);
}

export async function rejectSeriesContribution(contributionId: string) {
    return tryReject<unknown>(contributionId);
}
