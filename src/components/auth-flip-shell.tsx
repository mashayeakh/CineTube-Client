/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
    ArrowLeft,
    Check,
    Clapperboard,
    Eye,
    EyeOff,
    Film,
    Lock,
    Mail,
    Play,
    ShieldCheck,
    User,
    Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useForm } from "@tanstack/react-form"
import { loginAction } from "@/app/(public)/(authRoutes)/login/_action/loginAction"
import { signupAction } from "@/app/(public)/(authRoutes)/signup/_action/signupAction"
import { ILoginPayload, ISignupPayload, loginZodSchema, signupZodSchema } from "@/zod/auth.validation"
import { useMutation, useQueryClient } from "@tanstack/react-query"

type AuthMode = "login" | "signup"

interface LoginFormProps {
    redirectPath?: string;
}

const DEMO_EMAIL = "yt@gmail.com"
const DEMO_PASSWORD = "Yt123456"

export function AuthFlipShell({ initialMode, LoginFormProps = {} }: { initialMode: AuthMode; LoginFormProps?: LoginFormProps }) {
    const router = useRouter()
    const [mode, setMode] = useState<AuthMode>(initialMode)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [password, setPassword] = useState("")
    const [signupName, setSignupName] = useState("")
    const [signupEmail, setSignupEmail] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [signupError, setSignupError] = useState<string | null>(null)
    const [signupSuccess, setSignupSuccess] = useState(false)
    const redirectPath = LoginFormProps.redirectPath

    const isSignup = mode === "signup"

    const passwordChecks = useMemo(
        () => [
            {
                label: "At least 8 characters",
                passed: password.length >= 8,
            },
            {
                label: "At least one number or symbol",
                passed: /[0-9\W_]/.test(password),
            },
            {
                label: "Uppercase and lowercase letters",
                passed: /[A-Z]/.test(password) && /[a-z]/.test(password),
            },
        ],
        [password]
    )
    const queryClient = useQueryClient()

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (payload: ILoginPayload) => loginAction(payload, redirectPath),
    })

    const { mutateAsync: signupMutate, isPending: isSignupPending } = useMutation({
        mutationFn: (payload: ISignupPayload) => signupAction(payload),
    })

    const [serverError, setServerError] = useState<string | null>(null)
    const [isDemoLoading, setIsDemoLoading] = useState(false)

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },

        onSubmit: async ({ value }) => {
            setServerError(null)

            const parsedPayload = loginZodSchema.safeParse(value)
            if (!parsedPayload.success) {
                setServerError(parsedPayload.error.issues[0]?.message || "Please provide valid credentials")
                return
            }

            try {
                const result = (await mutateAsync(parsedPayload.data)) as any
                if (!result.success) {
                    setServerError(result.message || "Login failed")
                    return
                }
                queryClient.invalidateQueries({ queryKey: ["user"] })
                const nextPath = result?.result?.redirectTo as string | undefined
                if (nextPath) {
                    router.push(nextPath)
                    return
                }
                router.refresh()
            } catch (error: any) {
                console.error("Login failed:", error)
                setServerError("An unexpected error occurred. Please try again. " + (error.message || ""))
            }
        },
    })

    const handleDemoLogin = async () => {
        setIsDemoLoading(true)
        setServerError(null)

        // Switch to login mode if on signup
        if (isSignup) {
            setMode("login")
            router.replace("/login", { scroll: false })
        }

        // Pre-fill the form fields visually
        form.setFieldValue("email", DEMO_EMAIL)
        form.setFieldValue("password", DEMO_PASSWORD)

        try {
            const parsedPayload = loginZodSchema.safeParse({
                email: DEMO_EMAIL,
                password: DEMO_PASSWORD,
            })

            if (!parsedPayload.success) {
                setServerError("Demo credentials are invalid.")
                setIsDemoLoading(false)
                return
            }

            const result = (await mutateAsync(parsedPayload.data)) as any

            if (!result.success) {
                setServerError(result.message || "Demo login failed")
                setIsDemoLoading(false)
                return
            }

            queryClient.invalidateQueries({ queryKey: ["user"] })
            const nextPath = result?.result?.redirectTo as string | undefined
            if (nextPath) {
                router.push(nextPath)
                return
            }
            router.refresh()
        } catch (error: any) {
            console.error("Demo login failed:", error)
            setServerError("Demo login failed. Please try again.")
        } finally {
            setIsDemoLoading(false)
        }
    }

    const switchMode = (nextMode: AuthMode) => {
        setMode(nextMode)
        router.replace(nextMode === "login" ? "/login" : "/signup", { scroll: false })
    }

    return (
        <main className="h-svh overflow-hidden bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_35%),linear-gradient(135deg,#e7eeff_0%,#f7f8fc_45%,#eef4ff_100%)]">
            <div className="flex h-full w-full overflow-hidden bg-white/92 backdrop-blur">
                <section className="relative flex w-full flex-col justify-between px-6 py-3 sm:px-8 sm:py-4 lg:w-[60%] lg:px-10 lg:py-5">
                    <div className="flex items-center justify-between gap-4">
                        <Link
                            href="/"
                            className="inline-flex size-11 items-center justify-center rounded-full border border-border/70 bg-background text-foreground transition-colors hover:bg-muted"
                        >
                            <ArrowLeft className="size-4" />
                        </Link>

                        <div className="text-sm text-muted-foreground">
                            {isSignup ? "Already a member?" : "New here?"}{" "}
                            <button
                                type="button"
                                onClick={() => switchMode(isSignup ? "login" : "signup")}
                                className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500"
                            >
                                {isSignup ? "Sign in" : "Create account"}
                            </button>
                        </div>
                    </div>

                    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center py-2 lg:py-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={mode}
                                initial={{ opacity: 0, rotateX: -8, y: 18 }}
                                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                                exit={{ opacity: 0, rotateX: 8, y: -12 }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                                className="origin-top"
                            >
                                <div className="mb-4 space-y-2">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                                        <Clapperboard className="size-3.5" />
                                        {isSignup ? "Join CineTube" : "Welcome back"}
                                    </div>
                                    <div className="space-y-1.5">
                                        <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                                            {isSignup ? "Sign Up" : "Sign In"}
                                        </h1>
                                        <p className="max-w-md text-sm text-slate-400">
                                            {isSignup
                                                ? "Create your CineTube profile to rate films, build watchlists, and join the discussion."
                                                : "Sign in to continue your reviews, ratings, and saved movie collections."}
                                        </p>
                                    </div>
                                </div>

                                {/* ── Demo login banner (login mode only) ── */}
                                {!isSignup && (
                                    <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-amber-800">Try the demo account</p>
                                            <p className="mt-0.5 truncate text-[11px] text-amber-600">
                                                {DEMO_EMAIL} · ••••••••
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleDemoLogin}
                                            disabled={isDemoLoading || isPending}
                                            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-amber-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <Zap className="size-3.5" />
                                            {isDemoLoading ? "Logging in…" : "Quick login"}
                                        </button>
                                    </div>
                                )}

                                <form
                                    className="space-y-3"
                                    noValidate
                                    onSubmit={async (e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        if (isSignup) {
                                            setSignupError(null)
                                            setSignupSuccess(false)
                                            const parsed = signupZodSchema.safeParse({ name: signupName, email: signupEmail, password, confirmPassword })
                                            if (!parsed.success) {
                                                setSignupError(parsed.error.issues[0]?.message || "Invalid input")
                                                return
                                            }
                                            const result = await signupMutate(parsed.data) as any
                                            if (!result.success) {
                                                setSignupError(result.message || "Signup failed")
                                                return
                                            }
                                            setSignupSuccess(true)
                                            router.push(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`)
                                        } else {
                                            form.handleSubmit()
                                        }
                                    }}
                                >
                                    {isSignup && (
                                        <FieldShell icon={<User className="size-4" />} label="Full name">
                                            <Input
                                                placeholder="Daniel Ahmadi"
                                                value={signupName}
                                                onChange={(e) => setSignupName(e.target.value)}
                                                className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                                            />
                                        </FieldShell>
                                    )}

                                    {isSignup ? (
                                        <FieldShell icon={<Mail className="size-4" />} label="Email address">
                                            <Input
                                                placeholder="name@example.com"
                                                type="email"
                                                value={signupEmail}
                                                onChange={(e) => setSignupEmail(e.target.value)}
                                                className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                                            />
                                        </FieldShell>
                                    ) : (
                                        <form.Field
                                            name="email"
                                            validators={{ onChange: loginZodSchema.shape.email }}
                                        >
                                            {(field) => (
                                                <FieldShell icon={<Mail className="size-4" />} label="Email address">
                                                    <Input
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(event) => field.handleChange(event.target.value)}
                                                        placeholder="name@example.com"
                                                        type="email"
                                                        className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                                                    />
                                                </FieldShell>
                                            )}
                                        </form.Field>
                                    )}

                                    {isSignup ? (
                                        <FieldShell
                                            icon={<Lock className="size-4" />}
                                            label="Password"
                                            trailing={
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((current) => !current)}
                                                    className="text-slate-400 transition-colors hover:text-slate-700"
                                                >
                                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </button>
                                            }
                                        >
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create a password"
                                                value={password}
                                                onChange={(event) => setPassword(event.target.value)}
                                                className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                                            />
                                        </FieldShell>
                                    ) : (
                                        <form.Field
                                            name="password"
                                            validators={{ onChange: loginZodSchema.shape.password }}
                                        >
                                            {(field) => (
                                                <FieldShell
                                                    icon={<Lock className="size-4" />}
                                                    label="Password"
                                                    trailing={
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword((current) => !current)}
                                                            className="text-slate-400 transition-colors hover:text-slate-700"
                                                        >
                                                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                        </button>
                                                    }
                                                >
                                                    <Input
                                                        name={field.name}
                                                        type={showPassword ? "text" : "password"}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(event) => field.handleChange(event.target.value)}
                                                        placeholder="Enter your password"
                                                        className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                                                    />
                                                </FieldShell>
                                            )}
                                        </form.Field>
                                    )}

                                    {isSignup && (
                                        <div className="space-y-2.5">
                                            <div className="space-y-2">
                                                {passwordChecks.map((item) => (
                                                    <div key={item.label} className="flex items-center gap-2 text-xs">
                                                        <span
                                                            className={cn(
                                                                "inline-flex size-4 items-center justify-center rounded-full border",
                                                                item.passed
                                                                    ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                                                                    : "border-slate-200 bg-white text-slate-300"
                                                            )}
                                                        >
                                                            <Check className="size-3" />
                                                        </span>
                                                        <span className={item.passed ? "text-emerald-600" : "text-slate-400"}>
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <FieldShell
                                                icon={<Lock className="size-4" />}
                                                label="Confirm password"
                                                trailing={
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword((current) => !current)}
                                                        className="text-slate-400 transition-colors hover:text-slate-700"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                    </button>
                                                }
                                            >
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Re-type password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                                                />
                                            </FieldShell>
                                        </div>
                                    )}

                                    {!isSignup && (
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <Link href="/forgetPassword" className="font-medium text-indigo-600 hover:text-indigo-500">
                                                Forgot password?
                                            </Link>
                                        </div>
                                    )}

                                    {!isSignup && serverError && (
                                        <p className="text-xs text-destructive">{serverError}</p>
                                    )}

                                    {isSignup && signupError && (
                                        <p className="text-xs text-destructive">{signupError}</p>
                                    )}

                                    {isSignup && signupSuccess && (
                                        <p className="text-xs text-emerald-600">Account created! Redirecting to sign in...</p>
                                    )}

                                    <div className="flex flex-col gap-2 pt-1.5 sm:flex-row sm:items-center">
                                        {isSignup ? (
                                            <Button
                                                type="submit"
                                                disabled={isSignupPending}
                                                className="h-10 rounded-full bg-linear-to-r from-indigo-600 via-indigo-500 to-blue-500 px-7 text-white shadow-[0_16px_30px_rgba(79,70,229,0.28)] hover:from-indigo-500 hover:via-indigo-500 hover:to-blue-400"
                                            >
                                                {isSignupPending ? "Creating account..." : "Sign Up"}
                                                <span className="ml-2 inline-flex size-6 items-center justify-center rounded-full bg-white/20">
                                                    <ArrowLeft className="size-3.5 rotate-180" />
                                                </span>
                                            </Button>
                                        ) : (
                                            <form.Subscribe
                                                selector={(state) => [state.canSubmit, state.isSubmitting] as const}
                                            >
                                                {([canSubmit, isSubmitting]) => (
                                                    <Button
                                                        type="submit"
                                                        disabled={!canSubmit || isSubmitting || isPending || isDemoLoading}
                                                        className="h-10 rounded-full bg-linear-to-r from-indigo-600 via-indigo-500 to-blue-500 px-7 text-white shadow-[0_16px_30px_rgba(79,70,229,0.28)] hover:from-indigo-500 hover:via-indigo-500 hover:to-blue-400"
                                                    >
                                                        {isSubmitting || isPending ? "Logging in..." : "Sign In"}
                                                        <span className="ml-2 inline-flex size-6 items-center justify-center rounded-full bg-white/20">
                                                            <ArrowLeft className="size-3.5 rotate-180" />
                                                        </span>
                                                    </Button>
                                                )}
                                            </form.Subscribe>
                                        )}
                                    </div>
                                </form>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="inline-flex items-center gap-2">
                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-100 text-xs">EN</span>
                            English
                        </div>
                        <div className="hidden items-center gap-2 sm:inline-flex">
                            <ShieldCheck className="size-4 text-emerald-500" />
                            Secure auth surface
                        </div>
                    </div>
                </section>

                <aside className="relative hidden overflow-hidden bg-linear-to-br from-fuchsia-700 via-pink-600 to-violet-600 lg:flex lg:w-[40%] lg:flex-col lg:justify-between">
                    <div className="absolute inset-0">
                        <div className="absolute -left-24 -top-16 h-72 w-72 rounded-full bg-fuchsia-900/30" />
                        <div className="absolute right-8 top-20 h-52 w-52 rounded-[3rem] bg-white/10" />
                        <div className="absolute -bottom-18 left-10 h-96 w-96 rotate-12 rounded-[5rem] bg-indigo-400/35" />
                        <div className="absolute bottom-8 right-10 h-40 w-40 rounded-full bg-violet-900/25" />
                    </div>

                    <div className="relative z-10 px-6 pt-7 text-white xl:px-8">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide backdrop-blur-sm">
                            <Film className="size-4" />
                            CINE STREAM MODE
                        </div>

                        <motion.div
                            key={`panel-${mode}`}
                            initial={{ opacity: 0, x: 18 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="mt-6 max-w-sm"
                        >
                            <h2 className="text-4xl font-black leading-tight tracking-tight">
                                {isSignup ? "Hello, Friend!" : "Welcome Back"}
                            </h2>
                            <p className="mt-3 text-base text-pink-100/95">
                                {isSignup
                                    ? "Create an account and start sharing your favorite scenes, reviews, and watchlists."
                                    : "To stay connected with CineTube, sign in with your personal credentials."}
                            </p>
                            <button
                                type="button"
                                onClick={() => switchMode(isSignup ? "login" : "signup")}
                                className="mt-7 inline-flex h-11 items-center justify-center rounded-full border border-white/50 px-7 text-sm font-semibold tracking-wide text-white transition hover:bg-white/15"
                            >
                                {isSignup ? "SIGN IN" : "CREATE ACCOUNT"}
                            </button>
                        </motion.div>
                    </div>

                    <div className="relative z-10 px-6 pb-6 xl:px-8">
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                            className="max-w-sm rounded-[1.5rem] border border-white/15 bg-white/10 px-5 py-5 text-white backdrop-blur-sm"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-white/20">
                                    <Clapperboard className="size-5" />
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide">
                                    <Play className="size-3 fill-current" />
                                    Live review room
                                </div>
                            </div>

                            <h3 className="text-2xl font-black tracking-tight">watch and share your best movies</h3>
                            <p className="mt-2 text-sm text-pink-100/90">
                                Join the community and keep your ratings, favorites, and comments in one secure profile.
                            </p>

                            <div className="mt-4 grid grid-cols-3 gap-2">
                                <div className="rounded-xl bg-black/20 p-2 text-center">
                                    <p className="text-xs text-pink-100/80">Reels</p>
                                    <p className="mt-1 text-base font-black">128</p>
                                </div>
                                <div className="rounded-xl bg-black/20 p-2 text-center">
                                    <p className="text-xs text-pink-100/80">Reviews</p>
                                    <p className="mt-1 text-base font-black">1.2k</p>
                                </div>
                                <div className="rounded-xl bg-black/20 p-2 text-center">
                                    <p className="text-xs text-pink-100/80">Lists</p>
                                    <p className="mt-1 text-base font-black">320</p>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs text-pink-50">
                                <ShieldCheck className="size-4" />
                                Your account data stays protected while you explore.
                            </div>
                        </motion.div>
                    </div>
                </aside>
            </div>
        </main>
    )
}

function FieldShell({
    children,
    icon,
    label,
    trailing,
}: {
    children: React.ReactNode
    icon: React.ReactNode
    label: string
    trailing?: React.ReactNode
}) {
    return (
        <div className="border-b border-slate-200 pb-1.5">
            <div className="flex items-center gap-2.5 text-slate-400">
                <span>{icon}</span>
                <div className="min-w-0 flex-1">
                    <p className="mb-0 text-xs font-medium uppercase tracking-[0.22em] text-slate-300">
                        {label}
                    </p>
                    {children}
                </div>
                {trailing}
            </div>
        </div>
    )
}