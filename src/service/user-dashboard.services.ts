import { httpClient, type ApiRequestOptions } from "@/lib/axios/httpClient";
import type { ApiResponse, PaginationMeta } from "@/types/api.types";

type ApiEnvelope<TData> = ApiResponse<TData> & {
    data?: TData;
};

export interface UserServiceResponse<TData> {
    data: TData;
    message: string;
    meta?: PaginationMeta;
}

function unwrapEnvelope<TData>(response: ApiEnvelope<TData> | TData): UserServiceResponse<TData> {
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

async function userGet<TData>(endpoint: string, options?: ApiRequestOptions) {
    const response = await httpClient.get<TData>(endpoint, options);
    return unwrapEnvelope(response as ApiEnvelope<TData>);
}

export async function getUserDashboardStats(options?: ApiRequestOptions) {
    return userGet<Record<string, unknown>>("/user/dashboard/stats", options);
}

export async function getUserDashboardWatchlist(options?: ApiRequestOptions) {
    return userGet<unknown>("/user/dashboard/watchlist", options);
}

export async function getUserDashboardReviews(options?: ApiRequestOptions) {
    return userGet<unknown>("/user/dashboard/reviews", options);
}

export async function getUserDashboardComments(options?: ApiRequestOptions) {
    return userGet<unknown>("/user/dashboard/comments", options);
}

export async function getUserDashboardContributions(options?: ApiRequestOptions) {
    return userGet<unknown>("/user/dashboard/contributions", options);
}

export async function getUserDashboardSubscriptions(options?: ApiRequestOptions) {
    return userGet<unknown>("/user/dashboard/subscriptions", options);
}

export async function getUserDashboardPayments(options?: ApiRequestOptions) {
    return userGet<unknown>("/user/dashboard/payments", options);
}
