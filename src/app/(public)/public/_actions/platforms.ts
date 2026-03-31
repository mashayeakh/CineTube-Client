"use server"

import { httpClient } from "@/lib/axios/httpClient"

export const getStreamingPlatforms = async () => {
    try {
        const res = await httpClient.get("/streaming-platforms")
        return Array.isArray(res?.result) ? res.result : []
    } catch {
        return []
    }
}
