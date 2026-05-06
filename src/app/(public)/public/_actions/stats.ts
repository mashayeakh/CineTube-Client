"use server"

import { httpClient } from "@/lib/axios/httpClient"

export const getCommunityStats = async () => {
    const res = await httpClient.get("/landing/community-stats")
    return res?.result ?? null
}
