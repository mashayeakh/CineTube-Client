import { httpClient } from "@/lib/axios/httpClient";

const REVIEW_LIST_ENDPOINTS = [
    "/reviews/all/reviews",
    "/reviews",
    "/review",
    "/admin/reviews",
    "/admin/review",
    "/admin/reviews-moderation",
    "/admin/dashboard/reviews-moderation/pending",
];

const APPROVE_ENDPOINTS = [
    "/admin/approve-review",
    "/admin/dashboard/reviews-moderation",
];

const REJECT_ENDPOINTS = [
    "/admin/reject-review",
    "/admin/dashboard/reviews-moderation",
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

async function tryApprove<T>(reviewId: string): Promise<T> {
    let lastError: unknown = null;

    for (const endpoint of APPROVE_ENDPOINTS) {
        try {
            if (endpoint.includes("dashboard")) {
                const response = await httpClient.patch<T>(`${endpoint}/${reviewId}/approve`, {});
                return (response?.result ?? response?.data ?? response) as T;
            }

            const response = await httpClient.post<T>(`${endpoint}/${reviewId}`, {});
            return (response?.result ?? response?.data ?? response) as T;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError;
}

async function tryReject<T>(reviewId: string): Promise<T> {
    let lastError: unknown = null;

    for (const endpoint of REJECT_ENDPOINTS) {
        try {
            if (endpoint.includes("dashboard")) {
                const response = await httpClient.patch<T>(`${endpoint}/${reviewId}/reject`, {});
                return (response?.result ?? response?.data ?? response) as T;
            }

            const response = await httpClient.post<T>(`${endpoint}/${reviewId}`, {});
            return (response?.result ?? response?.data ?? response) as T;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError;
}

export async function getAdminReviews() {
    return tryGet<unknown[]>(REVIEW_LIST_ENDPOINTS);
}

export async function approveReview(reviewId: string) {
    return tryApprove<unknown>(reviewId);
}

export async function rejectReview(reviewId: string) {
    return tryReject<unknown>(reviewId);
}
