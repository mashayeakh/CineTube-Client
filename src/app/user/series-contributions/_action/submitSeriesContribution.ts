/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { cookies } from "next/headers"

function getBaseCandidates() {
    const envBase =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        process.env.NEXT_PUBLIC_API_URL

    const bases = [
        envBase,
        "http://localhost:5000/api/v1",
        "http://localhost:5000",
    ]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.replace(/\/$/, ""))

    return Array.from(new Set(bases))
}

async function postSeries(formData: FormData, cookieHeader: string, accessToken?: string) {
    const bases = getBaseCandidates()
    const paths = ["/series/create", "/api/v1/series/create"]

    let lastMessage = "Failed to submit series contribution."

    for (const base of bases) {
        for (const path of paths) {
            const url = `${base}${path}`

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
                    console.log("[series] submit SUCCESS via:", url)
                    return payload
                }

                lastMessage =
                    payload && typeof payload === "object" && "message" in payload
                        ? String((payload as { message?: unknown }).message || "")
                        : `Request failed with status ${res.status}`

                console.log("[series] submit FAILED via:", url, "| status:", res.status, "| message:", lastMessage)
            } catch (error) {
                lastMessage = error instanceof Error ? error.message : lastMessage
                console.log("[series] submit ERROR via:", url, "| message:", lastMessage)
            }
        }
    }

    throw new Error(lastMessage || "Failed to submit series contribution.")
}

export async function submitSeriesContribution(formData: FormData) {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value
    const cookieHeader = cookieStore
        .getAll()
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ")

    console.log("[series] cookieHeader has session:", cookieHeader.includes("better-auth.session_token="))
    console.log("[series] accessToken found:", Boolean(accessToken))

    if (!cookieHeader.includes("better-auth.session_token=")) {
        return { success: false, message: "Not authenticated. Please log in again." }
    }

    try {
        const data = await postSeries(formData, cookieHeader, accessToken)
        return { success: true, data }
    } catch (error: any) {
        console.log("[series] submit FAILED — message:", error?.message)
        return {
            success: false,
            message: error?.message || "Failed to submit series contribution. Please try again.",
        }
    }
}
