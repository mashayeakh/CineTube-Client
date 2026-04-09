/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { cookies } from "next/headers"

function getBaseCandidates() {
    const envBase = (
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        ""
    ).replace(/\/$/, "")

    const localBases = ["http://localhost:5000/api/v1", "http://localhost:5000"]
    const preferredOrder = process.env.NODE_ENV === "development"
        ? [...localBases, envBase]
        : [envBase, ...localBases]

    const bases = preferredOrder
        .filter((value): value is string => Boolean(value))
        .map((value) => value.replace(/\/$/, ""))

    return Array.from(new Set(bases))
}

function getSeriesContributionEndpoints(base: string) {
    const hasApiV1InBase = /\/api\/v1(?:\/|$)/i.test(base)

    if (hasApiV1InBase) {
        return ["/series-contributions"]
    }

    return ["/api/v1/series-contributions", "/series-contributions"]
}

export async function submitSeriesContribution(formData: FormData) {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value
    const cookieHeader = cookieStore
        .getAll()
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ")

    const bases = getBaseCandidates()
    let lastMessage = "Failed to submit series contribution."
    let lastStatus: number | null = null

    for (const base of bases) {
        const endpoints = getSeriesContributionEndpoints(base)

        for (const endpoint of endpoints) {
            const url = `${base}${endpoint}`

            try {
                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        Cookie: cookieHeader,
                        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                    },
                    body: formData,
                    cache: "no-store",
                })

                const payload = await res.json().catch(() => null)

                if (res.ok) {
                    const message =
                        payload && typeof payload === "object" && "message" in payload
                            ? String((payload as { message?: unknown }).message ?? "")
                            : ""

                    return {
                        success: true,
                        data: payload,
                        message: message || "Series contribution submitted successfully.",
                    }
                }

                lastStatus = res.status
                lastMessage =
                    payload && typeof payload === "object" && "message" in payload
                        ? String((payload as { message?: unknown }).message ?? "") || `Request failed with status ${res.status}`
                        : `Request failed with status ${res.status}`

                // Only continue to other base/path combinations when route is missing.
                if (res.status !== 404) {
                    return { success: false, message: lastMessage }
                }
            } catch (error: any) {
                lastStatus = null
                lastMessage = error?.message || lastMessage
            }
        }
    }

    return {
        success: false,
        message: lastStatus === 404
            ? `${lastMessage} (Checked: ${bases.join(", ")})`
            : lastMessage,
    }
}
