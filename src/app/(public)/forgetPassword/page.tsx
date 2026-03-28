"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { ArrowLeft, Clapperboard, Mail, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgetPassword() {
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
    const [newPassword, setNewPassword] = useState("")
    const [otpSent, setOtpSent] = useState(false)
    const otpInputsRef = useRef<Array<HTMLInputElement | null>>([])

    const handleSendOtp = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!email.trim()) return
        setOtpSent(true)
    }

    const handleResetPassword = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        // TODO: connect with reset password API
        console.log({ email, otp: otp.join(""), newPassword })
    }

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
                            Remember your password?{" "}
                            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                Sign in
                            </Link>
                        </div>
                    </div>

                    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center py-2 lg:py-0">
                        <div className="mb-4 space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                                <Clapperboard className="size-3.5" />
                                Account recovery
                            </div>
                            <div className="space-y-1.5">
                                <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                                    Forgot Password
                                </h1>
                                <p className="max-w-md text-sm text-slate-400">
                                    {!otpSent
                                        ? "Enter your email and we&apos;ll send you a reset otp to recover access to your CineTube account."
                                        : "Enter the OTP from your email and set a new password to complete account recovery."}
                                </p>
                            </div>
                        </div>

                        {!otpSent ? (
                            <form className="space-y-3" noValidate onSubmit={handleSendOtp}>
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

                                <div className="flex flex-col gap-2 pt-1.5 sm:flex-row sm:items-center">
                                    <Button
                                        type="submit"
                                        className="h-10 rounded-full bg-linear-to-r from-indigo-600 via-indigo-500 to-blue-500 px-7 text-white shadow-[0_16px_30px_rgba(79,70,229,0.28)] hover:from-indigo-500 hover:via-indigo-500 hover:to-blue-400"
                                    >
                                        Send Reset Otp
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <form className="space-y-3" noValidate onSubmit={handleResetPassword}>
                                <div className="border-b border-slate-200 pb-1.5">
                                    <div className="flex items-center gap-2.5 text-slate-400">
                                        <span><Mail className="size-4" /></span>
                                        <div className="min-w-0 flex-1">
                                            <p className="mb-0 text-xs font-medium uppercase tracking-[0.22em] text-slate-300">
                                                Email address
                                            </p>
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="name@example.com"
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

                                <div className="border-b border-slate-200 pb-1.5">
                                    <div className="flex items-center gap-2.5 text-slate-400">
                                        <span className="text-xs font-semibold">PW</span>
                                        <div className="min-w-0 flex-1">
                                            <p className="mb-0 text-xs font-medium uppercase tracking-[0.22em] text-slate-300">
                                                New password
                                            </p>
                                            <Input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Enter new password"
                                                className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 pt-1.5 sm:flex-row sm:items-center">
                                    <Button
                                        type="submit"
                                        className="h-10 rounded-full bg-linear-to-r from-indigo-600 via-indigo-500 to-blue-500 px-7 text-white shadow-[0_16px_30px_rgba(79,70,229,0.28)] hover:from-indigo-500 hover:via-indigo-500 hover:to-blue-400"
                                    >
                                        Reset Password
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="inline-flex items-center gap-2">
                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-100 text-xs">EN</span>
                            English
                        </div>
                        <div className="hidden items-center gap-2 sm:inline-flex">
                            <ShieldCheck className="size-4 text-emerald-500" />
                            Secure reset flow
                        </div>
                    </div>
                </section>

                <aside className="relative hidden overflow-hidden bg-linear-to-br from-fuchsia-700 via-pink-600 to-violet-600 lg:flex lg:w-[40%] lg:flex-col lg:justify-center">
                    <div className="absolute inset-0">
                        <div className="absolute -left-24 -top-16 h-72 w-72 rounded-full bg-fuchsia-900/30" />
                        <div className="absolute right-8 top-20 h-52 w-52 rounded-[3rem] bg-white/10" />
                        <div className="absolute -bottom-18 left-10 h-96 w-96 rotate-12 rounded-[5rem] bg-indigo-400/35" />
                        <div className="absolute bottom-8 right-10 h-40 w-40 rounded-full bg-violet-900/25" />
                    </div>
                    <div className="relative z-10 px-6 text-white xl:px-8">
                        <h2 className="text-4xl font-black leading-tight tracking-tight">Reset and get back in</h2>
                        <p className="mt-3 text-base text-pink-100/95">
                            We&apos;ll send recovery instructions to your email so you can continue exploring, rating, and reviewing movies.
                        </p>
                    </div>
                </aside>
            </div>
        </main>
    )
}
