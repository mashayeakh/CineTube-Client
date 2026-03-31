"use server"

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse, ApiErrorResponse } from "@/types/api.types";

export interface CreateReviewPayload {
    movieId: string;
    rating: number;
    content: string;
    tags?: string[];
}

export const createReviewAction = async (
    payload: CreateReviewPayload
): Promise<ApiResponse | ApiErrorResponse> => {
    const { movieId, rating, content, tags } = payload;

    if (!movieId || !content?.trim()) {
        return { success: false, message: "Movie and review content are required" };
    }

    if (rating < 0 || rating > 5) {
        return { success: false, message: "Rating must be between 0 and 5" };
    }

    try {
        const response = await httpClient.post("reviews", {
            movieId,
            rating,
            content: content.trim(),
            tags: tags ?? [],
        });
        return response;
    } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        const message =
            typeof err?.response?.data?.message === "string"
                ? err.response.data.message
                : "Failed to submit review. Please try again.";
        return { success: false, message };
    }
};
