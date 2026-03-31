"use server"

import { httpClient } from "@/lib/axios/httpClient"

export const getGenres = async () => {
    const res = await httpClient.get("/genres")
    return Array.isArray(res?.result) ? res.result : []
}

