"use server"

import { httpClient } from "@/lib/axios/httpClient"

export interface ReviewItem {
    id: string;
    userId: string;
    content: string;
    rating: number;
    createdAt: string;
    user?: {
        name?: string;
        email?: string;
    };
    movie?: {
        title?: string;
    };
    series?: {
        title?: string;
    };
}

export const getLatestReviews = async (): Promise<ReviewItem[]> => {
    const res = await httpClient.get<any>("/reviews/public/latest")
    const payload = res.result ?? res.data ?? res
    return Array.isArray(payload) ? payload : []
}
