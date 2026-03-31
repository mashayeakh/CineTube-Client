/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { httpClient } from "@/lib/axios/httpClient"

export async function submitMovieContribution(formData: FormData) {
    try {
        const response = await httpClient.post("/movie-contributions/movie", formData)
        return { success: true, data: response }
    } catch (error: any) {
        const message =
            error?.response?.data?.message ||
            "Failed to submit contribution. Please try again."
        return { success: false, message }
    }
}
