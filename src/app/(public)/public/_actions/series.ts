"use server"

import { httpClient } from "@/lib/axios/httpClient"

type SeriesResponse = {
    result?: {
        data?: unknown
    }
    data?: unknown
}

export const getSeries = async () => {
    try {
        const res = await httpClient.get("/series") as SeriesResponse
        // Backend returns: { result: { data: [...] } }
        if (Array.isArray(res?.result?.data)) {
            return res.result.data
        }
        if (Array.isArray(res?.result)) {
            return res.result
        }
        if (Array.isArray(res?.data)) {
            return res.data
        }
        return []
    } catch (error) {
        console.error("Failed to fetch series:", error)
        return []
    }
}
