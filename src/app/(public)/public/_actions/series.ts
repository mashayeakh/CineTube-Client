"use server"

import { httpClient } from "@/lib/axios/httpClient"

type SeriesResponse = {
    result?: {
        data?: unknown
    }
    data?: unknown
}

function extractSeriesArray(res: SeriesResponse) {
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
}

function extractFeaturedSeries(res: SeriesResponse) {
    const result = res?.result

    if (result && typeof result === "object" && !Array.isArray(result)) {
        return result as Record<string, unknown>
    }

    const data = res?.data

    if (data && typeof data === "object" && !Array.isArray(data)) {
        return data as Record<string, unknown>
    }

    return null
}

export const getSeries = async (isFeatured?: boolean) => {
    try {
        const res = await httpClient.get("/series", {
            params: typeof isFeatured === "boolean" ? { isFeatured } : undefined,
        }) as SeriesResponse

        return extractSeriesArray(res)
    } catch (error) {
        console.error("Failed to fetch series:", error)
        return []
    }
}

export const getFeaturedSeries = async () => {
    try {
        const res = await httpClient.get("/series/featured") as SeriesResponse
        return extractFeaturedSeries(res)
    } catch (error) {
        console.error("Failed to fetch featured series:", error)
        return null
    }
}
