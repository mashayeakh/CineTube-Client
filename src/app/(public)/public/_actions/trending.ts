"use server"

import { httpClient } from "@/lib/axios/httpClient";

export const getTrendingMoviesToday = async (activeTab: string) => {
    const endpoint = activeTab === "week"
        ? "/landing/trending/week"
        : "/landing/trending/today";
    const res = await httpClient.get(endpoint);

    // backend shape: { success, message, result: [] }
    return Array.isArray(res?.result) ? res.result : [];
};