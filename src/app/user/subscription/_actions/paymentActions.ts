/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { httpClient } from "@/lib/axios/httpClient"

export async function createCheckoutSession(subscriptionType: "MONTHLY" | "YEARLY") {
    try {
        const response = await httpClient.post("/payments/create-checkout-session", {
            subscriptionType,
        })

        const result = response?.result ?? response?.data
        const checkoutUrl =
            typeof result === "object" && result !== null && "checkoutUrl" in result
                ? (result as { checkoutUrl: string }).checkoutUrl
                : null

        if (!checkoutUrl) {
            return { success: false, message: "No checkout URL returned." }
        }

        return { success: true, checkoutUrl }
    } catch (error: any) {
        const message =
            error?.response?.data?.message ||
            "Failed to create checkout session. Please try again."
        return { success: false, message }
    }
}
