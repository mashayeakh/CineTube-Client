"use client"

import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { createCheckoutSession } from "../_actions/paymentActions"

type Plan = "MONTHLY" | "YEARLY"

type PricingCardsProps = {
    activePlan?: Plan | null
    activeEndsAt?: string | null
    hasActiveSubscription?: boolean
    pendingPlan?: Plan | null
    hasPendingSubscription?: boolean
}

export function PricingCards({
    activePlan = null,
    activeEndsAt = null,
    hasActiveSubscription = false,
    pendingPlan = null,
    hasPendingSubscription = false,
}: PricingCardsProps) {
    const [loading, setLoading] = useState<Plan | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handlePurchase = async (plan: Plan) => {
        setError(null)
        setLoading(plan)

        const result = await createCheckoutSession(plan)

        if (!result.success) {
            setError(result.message ?? "Something went wrong.")
            setLoading(null)
            return
        }

        // Redirect to Stripe checkout
        window.location.href = result.checkoutUrl!
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                {/* Monthly */}
                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 p-6 transition hover:border-slate-300 hover:shadow-sm">
                    <div>
                        {activePlan === "MONTHLY" ? (
                            <span className="mb-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                You are using this plan
                            </span>
                        ) : pendingPlan === "MONTHLY" ? (
                            <span className="mb-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                Waiting for admin confirmation
                            </span>
                        ) : null}
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Monthly</p>
                        <p className="mt-2 text-4xl font-bold text-slate-900">
                            $9.99
                            <span className="ml-1 text-sm font-normal text-slate-500">/month</span>
                        </p>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600">
                        {["Unlimited movie access", "Movie Contribution", "Priority support"].map((f) => (
                            <li key={f} className="flex items-center gap-2">
                                <Check className="size-4 text-emerald-500" />
                                {f}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => handlePurchase("MONTHLY")}
                        disabled={loading !== null || hasActiveSubscription || hasPendingSubscription}
                        className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:opacity-60"
                    >
                        {loading === "MONTHLY" ? (
                            <><Loader2 className="size-4 animate-spin" /> Redirecting…</>
                        ) : activePlan === "MONTHLY" ? (
                            "You are using this plan"
                        ) : pendingPlan === "MONTHLY" ? (
                            "Waiting for admin confirmation"
                        ) : hasPendingSubscription ? (
                            "Payment pending review"
                        ) : hasActiveSubscription ? (
                            activeEndsAt && activeEndsAt !== "—" ? `Available after ${activeEndsAt}` : "Unavailable until current subscription ends"
                        ) : (
                            "Purchase plan"
                        )}
                    </button>
                </div>

                {/* Yearly */}
                <div className="flex flex-col gap-4 rounded-xl border-2 border-slate-900 bg-slate-900 p-6 text-white shadow-lg">
                    <div className="flex items-start justify-between">
                        <div>
                            {activePlan === "YEARLY" ? (
                                <span className="mb-4 inline-flex rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                                    You are using this plan
                                </span>
                            ) : pendingPlan === "YEARLY" ? (
                                <span className="mb-4 inline-flex rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-200">
                                    Waiting for admin confirmation
                                </span>
                            ) : null}
                            <p className="text-sm font-semibold uppercase tracking-wider text-slate-300">Yearly</p>
                            <p className="mt-2 text-4xl font-bold">
                                $99.99
                                <span className="ml-1 text-sm font-normal text-slate-400">/year</span>
                            </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900">Best value</span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300">
                        {["Everything in Monthly", "Save ~16% vs monthly", "Early access to new features"].map((f) => (
                            <li key={f} className="flex items-center gap-2">
                                <Check className="size-4 text-emerald-400" />
                                {f}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => handlePurchase("YEARLY")}
                        disabled={loading !== null || hasActiveSubscription || hasPendingSubscription}
                        className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
                    >
                        {loading === "YEARLY" ? (
                            <><Loader2 className="size-4 animate-spin" /> Redirecting…</>
                        ) : activePlan === "YEARLY" ? (
                            "You are using this plan"
                        ) : pendingPlan === "YEARLY" ? (
                            "Waiting for admin confirmation"
                        ) : hasPendingSubscription ? (
                            "Payment pending review"
                        ) : hasActiveSubscription ? (
                            activeEndsAt && activeEndsAt !== "—" ? `Available after ${activeEndsAt}` : "Unavailable until current subscription ends"
                        ) : (
                            "Purchase plan"
                        )}
                    </button>
                </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    )
}
