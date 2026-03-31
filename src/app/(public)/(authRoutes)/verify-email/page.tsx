"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Clapperboard, Loader2, Mail, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { verifyEmailAction } from "./_actions/verifyEmailActions"

export default function VerifyEmailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const prefillEmail = searchParams.get("email") ?? ""

    const [email, setEmail] = useState(prefillEmail)
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const otpInputsRef = useRef<Array<HTMLInputElement | null>>([])

    const handleOtpChange = (index: number, rawValue: string) => {
        const digit = rawValue.replace(/\D/g, "").slice(-1)
        const nextOtp = [...otp]
        nextOtp[index] = digit
        setOtp(nextOtp)

        if (digit && index < 5) {
            otpInputsRef.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpInputsRef.current[index - 1]?.focus()
        }

        if (e.key === "ArrowLeft" && index > 0) {
            e.preventDefault()
            otpInputsRef.current[index - 1]?.focus()
        }

        if (e.key === "ArrowRight" && index < 5) {
            e.preventDefault()
            otpInputsRef.current[index + 1]?.focus()
        }
    }

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        if (!pasted) return

        const pastedChars = pasted.split("")
        const filledOtp = [...Array(6)].map((_, index) => pastedChars[index] ?? "")
        setOtp(filledOtp)

        const nextFocusIndex = Math.min(pasted.length, 5)
        otpInputsRef.current[nextFocusIndex]?.focus()
    }

    const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const otpValue = otp.join("")
        if (!email.trim() || otpValue.length !== 6) return
        setError(null)
        setSuccessMsg(null)
        setLoading(true)
        try {
            const result = await verifyEmailAction({ email: email.trim(), otp: otpValue })
            if (!result.success) {
                setError(result.message)
            } else {
                setSuccessMsg(result.message || "Email verified successfully!")
                setTimeout(() => router.push("/login"), 2000)
            }
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="h-svh overflow-hidden bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_35%),linear-gradient(135deg,#e7eeff_0%,#f7f8fc_45%,#eef4ff_100%)]">
            <div className="flex h-full w-full overflow-hidden bg-white/92 backdrop-blur">
                <section className="relative flex w-full flex-col justify-between px-6 py-3 sm:px-8 sm:py-4 lg:w-[60%] lg:px-10 lg:py-5">
                    <div className="flex items-center justify-between gap-4">
                        <Link
                            href="/login"
                            className="inline-flex size-11 items-center justify-center rounded-full border border-border/70 bg-background text-foreground transition-colors hover:bg-muted"
                        >
                            <ArrowLeft className="size-4" />
                        </Link>

                        <div className="text-sm text-muted-foreground">
                            Already verified?{" "}
                            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                Sign in
                            </Link>
                        </div>
                    </div>

                    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center py-2 lg:py-0">
                        <div className="mb-4 space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                                <Clapperboard className="size-3.5" />
                                Email verification
                            </div>
                            <div className="space-y-1.5">
                                <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                                    Verify Email
                                </h1>
                                <p className="max-w-md text-sm text-slate-400">
                                    We&apos;ve sent a 6-digit OTP to your email. Enter it below to verify your account and start using CineTube.
                                </p>
                            </div>
                        </div>

                        {error && (
                            <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                                {error}
                            </p>
                        )}
                        {successMsg && (
                            <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
                                {successMsg}
                            </p>
                        )}

                        <form className="space-y-3" noValidate onSubmit={handleVerify}>
                            <div className="border-b border-slate-200 pb-1.5">
                                <div className="flex items-center gap-2.5 text-slate-400">
                                    <span><Mail className="size-4" /></span>
                                    <div className="min-w-0 flex-1">
                                        <p className="mb-0 text-xs font-medium uppercase tracking-[0.22em] text-slate-300">
                                            Email address
                                        </p>
                                        <Input
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-indigo-100 bg-linear-to-r from-indigo-50/70 via-white to-blue-50/70 p-3.5">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
                                        OTP code
                                    </p>
                                    <span className="text-[11px] text-slate-400">6 digits only</span>
                                </div>

                                <div className="flex items-center justify-between gap-2 sm:gap-2.5">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => {
                                                otpInputsRef.current[index] = el
                                            }}
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            maxLength={1}
                                            value={otp[index]}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            onPaste={handleOtpPaste}
                                            aria-label={`OTP digit ${index + 1}`}
                                            className="h-9 w-9 rounded-xl border border-indigo-200 bg-white text-center text-base font-bold text-slate-800 shadow-[0_4px_12px_rgba(99,102,241,0.12)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:h-10 sm:w-10"
                                            required
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 pt-1.5 sm:flex-row sm:items-center">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="h-10 rounded-full bg-linear-to-r from-indigo-600 via-indigo-500 to-blue-500 px-7 text-white shadow-[0_16px_30px_rgba(79,70,229,0.28)] hover:from-indigo-500 hover:via-indigo-500 hover:to-blue-400"
                                >
                                    {loading ? <><Loader2 className="mr-2 size-4 animate-spin" /> Verifying...</> : "Verify Email"}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="inline-flex items-center gap-2">
                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-100 text-xs">EN</span>
                            English
                        </div>
                        <div className="hidden items-center gap-2 sm:inline-flex">
                            <ShieldCheck className="size-4 text-emerald-500" />
                            Secure verification
                        </div>
                    </div>
                </section>

                <aside className="relative hidden overflow-hidden bg-linear-to-br from-emerald-700 via-teal-600 to-cyan-600 lg:flex lg:w-[40%] lg:flex-col lg:justify-center">
                    <div className="absolute inset-0">
                        <div className="absolute -left-24 -top-16 h-72 w-72 rounded-full bg-emerald-900/30" />
                        <div className="absolute right-8 top-20 h-52 w-52 rounded-[3rem] bg-white/10" />
                        <div className="absolute -bottom-18 left-10 h-96 w-96 rotate-12 rounded-[5rem] bg-teal-400/35" />
                        <div className="absolute bottom-8 right-10 h-40 w-40 rounded-full bg-cyan-900/25" />
                    </div>
                    <div className="relative z-10 px-6 text-white xl:px-8">
                        <h2 className="text-4xl font-black leading-tight tracking-tight">Almost there!</h2>
                        <p className="mt-3 text-base text-emerald-100/95">
                            Verify your email to unlock the full CineTube experience — rate films, build watchlists, and join the community.
                        </p>
                    </div>
                </aside>
            </div>
        </main>
    )
}
