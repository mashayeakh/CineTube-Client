"use server"

import { httpClient } from "@/lib/axios/httpClient"

export const getMovieById = async (id: string) => {
    const res = await httpClient.get(`/movies/${id}`)
    // backend may return { success, message, result: {...} } or bare object
    return res?.result ?? res
}
