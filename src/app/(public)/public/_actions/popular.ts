"use server"

import { httpClient } from "@/lib/axios/httpClient"

export const getPopularMovies = async () => {
    const res = await httpClient.get("/landing/popular")
    return Array.isArray(res?.result) ? res.result : []
}

