import { httpClient, type ApiRequestOptions } from "@/lib/axios/httpClient";
import type { ApiResponse, PaginationMeta } from "@/types/api.types";

type ApiEnvelope<TData> = ApiResponse<TData> & {
    data?: TData;
};

export interface AdminServiceResponse<TData> {
    data: TData;
    message: string;
    meta?: PaginationMeta;
}

function unwrapEnvelope<TData>(response: ApiEnvelope<TData> | TData): AdminServiceResponse<TData> {
    if (typeof response === "object" && response !== null && !Array.isArray(response)) {
        const envelope = response as ApiEnvelope<TData>;

        if ("result" in envelope || "data" in envelope || "message" in envelope || "meta" in envelope) {
            return {
                data: (envelope.result ?? envelope.data ?? response) as TData,
                message: envelope.message ?? "Request completed",
                meta: envelope.meta,
            };
        }
    }

    return {
        data: response as TData,
        message: "Request completed",
    };
}

async function adminGet<TData>(endpoint: string, options?: ApiRequestOptions) {
    const response = await httpClient.get<TData>(endpoint, options);
    return unwrapEnvelope(response as ApiEnvelope<TData>);
}

async function adminPatch<TData>(endpoint: string, payload?: Record<string, unknown>, options?: ApiRequestOptions) {
    const response = await httpClient.patch<TData>(endpoint, payload ?? {}, options);
    return unwrapEnvelope(response as ApiEnvelope<TData>);
}

async function adminDelete<TData>(endpoint: string, options?: ApiRequestOptions) {
    const response = await httpClient.delete<TData>(endpoint, options);
    return unwrapEnvelope(response as ApiEnvelope<TData>);
}

export async function getAdminDashboardStats(options?: ApiRequestOptions) {
    return adminGet<Record<string, unknown>>("/admin/dashboard/stats/", options);
}

export async function getAdminDashboardUsers(options?: ApiRequestOptions) {
    return adminGet<unknown>("/admin/dashboard/users/", options);
}

export async function getAdminDashboardUserById(userId: string, options?: ApiRequestOptions) {
    return adminGet<Record<string, unknown>>(`/admin/dashboard/users/${userId}`, options);
}

export async function updateAdminDashboardUserStatus(userId: string, payload: Record<string, unknown>, options?: ApiRequestOptions) {
    return adminPatch<Record<string, unknown>>(`/admin/dashboard/users/${userId}/status`, payload, options);
}

export async function updateAdminDashboardUserRole(userId: string, payload: Record<string, unknown>, options?: ApiRequestOptions) {
    return adminPatch<Record<string, unknown>>(`/admin/dashboard/users/${userId}/role`, payload, options);
}

export async function getAdminDashboardMovies(options?: ApiRequestOptions) {
    return adminGet<unknown>("/admin/dashboard/movies/", options);
}

export async function getAdminDashboardMovieById(movieId: string, options?: ApiRequestOptions) {
    return adminGet<Record<string, unknown>>(`/admin/dashboard/movies/${movieId}`, options);
}

export async function updateAdminDashboardMovie(movieId: string, payload: Record<string, unknown>, options?: ApiRequestOptions) {
    return adminPatch<Record<string, unknown>>(`/admin/dashboard/movies/${movieId}`, payload, options);
}

export async function deleteAdminDashboardMovie(movieId: string, options?: ApiRequestOptions) {
    return adminDelete<Record<string, unknown>>(`/admin/dashboard/movies/${movieId}`, options);
}

export async function getPendingAdminDashboardReviews(options?: ApiRequestOptions) {
    return adminGet<unknown>("/admin/dashboard/reviews-moderation/pending", options);
}

export async function approveAdminDashboardReview(reviewId: string, payload?: Record<string, unknown>, options?: ApiRequestOptions) {
    return adminPatch<Record<string, unknown>>(`/admin/dashboard/reviews-moderation/${reviewId}/approve`, payload, options);
}

export async function rejectAdminDashboardReview(reviewId: string, payload?: Record<string, unknown>, options?: ApiRequestOptions) {
    return adminPatch<Record<string, unknown>>(`/admin/dashboard/reviews-moderation/${reviewId}/reject`, payload, options);
}

export async function markAdminDashboardReviewSpoiler(reviewId: string, payload?: Record<string, unknown>, options?: ApiRequestOptions) {
    return adminPatch<Record<string, unknown>>(`/admin/dashboard/reviews-moderation/${reviewId}/spoiler`, payload, options);
}

export async function deleteAdminDashboardReview(reviewId: string, options?: ApiRequestOptions) {
    return adminDelete<Record<string, unknown>>(`/admin/dashboard/reviews-moderation/${reviewId}`, options);
}

export async function getAdminDashboardComments(options?: ApiRequestOptions) {
    return adminGet<unknown>("/admin/dashboard/comments-management/", options);
}

export async function getAdminDashboardCommentById(commentId: string, options?: ApiRequestOptions) {
    return adminGet<Record<string, unknown>>(`/admin/dashboard/comments-management/${commentId}`, options);
}

export async function deleteAdminDashboardComment(commentId: string, options?: ApiRequestOptions) {
    return adminDelete<Record<string, unknown>>(`/admin/dashboard/comments-management/${commentId}`, options);
}

export async function markAdminDashboardCommentSpoiler(commentId: string, payload?: Record<string, unknown>, options?: ApiRequestOptions) {
    return adminPatch<Record<string, unknown>>(`/admin/dashboard/comments-management/${commentId}/spoiler`, payload, options);
}

export async function getAdminDashboardMovieContributions(options?: ApiRequestOptions) {
    return adminGet<unknown>("/admin/dashboard/movie-contributions/", options);
}

export async function getAdminDashboardMovieContributionById(id: string, options?: ApiRequestOptions) {
    return adminGet<Record<string, unknown>>(`/admin/dashboard/movie-contributions/${id}`, options);
}

export async function approveAdminDashboardMovieContribution(id: string, payload?: Record<string, unknown>, options?: ApiRequestOptions) {
    return adminPatch<Record<string, unknown>>(`/admin/dashboard/movie-contributions/${id}/approve`, payload, options);
}

export async function rejectAdminDashboardMovieContribution(id: string, payload?: Record<string, unknown>, options?: ApiRequestOptions) {
    return adminPatch<Record<string, unknown>>(`/admin/dashboard/movie-contributions/${id}/reject`, payload, options);
}

export async function deleteAdminDashboardMovieContribution(id: string, options?: ApiRequestOptions) {
    return adminDelete<Record<string, unknown>>(`/admin/dashboard/movie-contributions/${id}`, options);
}

export async function getAdminDashboardPayments(options?: ApiRequestOptions) {
    return adminGet<unknown>("/admin/dashboard/payments/", options);
}

export async function getAdminDashboardPaymentById(id: string, options?: ApiRequestOptions) {
    return adminGet<Record<string, unknown>>(`/admin/dashboard/payments/${id}`, options);
}

export async function getAdminDashboardRevenueStats(options?: ApiRequestOptions) {
    return adminGet<Record<string, unknown>>("/admin/dashboard/payments/stats/revenue", options);
}

export async function getAdminDashboardSubscriptions(options?: ApiRequestOptions) {
    return adminGet<unknown>("/admin/dashboard/subscriptions/", options);
}

export async function getAdminDashboardSubscriptionById(id: string, options?: ApiRequestOptions) {
    return adminGet<Record<string, unknown>>(`/admin/dashboard/subscriptions/${id}`, options);
}

export async function getAdminDashboardSubscriptionStats(options?: ApiRequestOptions) {
    return adminGet<Record<string, unknown>>("/admin/dashboard/subscriptions/stats", options);
}

export async function getAdminDashboardTopWatchlistMovies(options?: ApiRequestOptions) {
    return adminGet<unknown>("/admin/dashboard/watchlist/top-movies", options);
}

export async function getAdminDashboardWatchlistCounts(options?: ApiRequestOptions) {
    return adminGet<Record<string, unknown>>("/admin/dashboard/watchlist/counts", options);
}

export async function getAdminDashboardUsersGrowthChart(options?: ApiRequestOptions) {
    return adminGet<unknown>("/admin/dashboard/charts/users-growth", options);
}

export async function getAdminDashboardMoviesGrowthChart(options?: ApiRequestOptions) {
    return adminGet<unknown>("/admin/dashboard/charts/movies-growth", options);
}

export async function getAdminDashboardRevenueGrowthChart(options?: ApiRequestOptions) {
    return adminGet<unknown>("/admin/dashboard/charts/revenue-growth", options);
}

export async function getAdminDashboardReviewsPerDayChart(options?: ApiRequestOptions) {
    return adminGet<unknown>("/admin/dashboard/charts/reviews-per-day", options);
}