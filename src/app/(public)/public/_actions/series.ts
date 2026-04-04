"use server"

import { httpClient } from "@/lib/axios/httpClient"

export const getSeries = async () => {
    try {
        const res = await httpClient.get("/series")
        return Array.isArray(res?.result) ? res.result : Array.isArray(res?.data) ? res.data : []
    } catch (error) {
        console.error("Failed to fetch series:", error)
        return []
    }
}
