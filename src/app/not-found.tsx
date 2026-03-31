"use client"

import Link from "next/link"
import { useState } from "react"
import { Home, Film, Clapperboard, Star } from "lucide-react"

export default function NotFound() {
    const [gifFailed, setGifFailed] = useState(false)

    return (
        <main
            className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-center"
            style={{
                background:
                    "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(79,70,229,0.28) 0%, rgba(6,6,18,1) 65%), linear-gradient(160deg,#07071a 0%,#0d0d24 100%)",
            }}
        >
            {/* Subtle dot-grid film-grain */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                }}
                aria-hidden="true"
            />

            {/* Glow blobs */}
            <div className="pointer-events-none absolute left-[8%] top-[12%] h-72 w-72 rounded-full bg-indigo-600/25 blur-[100px]" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-[8%] right-[8%] h-64 w-64 rounded-full bg-violet-600/20 blur-[90px]" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-[25%] left-[20%] h-48 w-48 rounded-full bg-blue-600/15 blur-[70px]" aria-hidden="true" />

            {/* Decorative SVG curves (mirroring reference) */}
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 1200 700"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
            >
                <path d="M 950 20 Q 1100 180 1020 380 Q 900 560 1050 700" stroke="white" strokeWidth="1.2" strokeOpacity="0.07" fill="none" />
                <path d="M 30 80 Q 180 280 60 520" stroke="white" strokeWidth="1.2" strokeOpacity="0.06" fill="none" />
                <path d="M 1150 400 Q 1050 500 1120 650" stroke="white" strokeWidth="0.8" strokeOpacity="0.05" fill="none" />
            </svg>

            {/* Floating film elements (like moons/planets in reference) */}
            <div
                className="pointer-events-none absolute left-[6%] top-[40%] flex size-16 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm sm:size-20"
                aria-hidden="true"
            >
                <Film className="size-7 text-indigo-300/60 sm:size-9" />
            </div>
            <div
                className="pointer-events-none absolute right-[5%] top-[20%] flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm sm:size-16"
                aria-hidden="true"
            >
                <Star className="size-5 text-yellow-300/50 sm:size-6" />
            </div>
            <div
                className="pointer-events-none absolute bottom-[18%] right-[12%] flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm sm:size-14"
                aria-hidden="true"
            >
                <Clapperboard className="size-4 text-pink-300/50 sm:size-5" />
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center px-6 py-10">
                {/* Ooops! */}
                <h1 className="mb-6 text-4xl font-bold tracking-wide text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.25)] sm:text-5xl">
                    Ooops!
                </h1>

                {/* 4 — circle — 4  (like reference layout) */}
                <div className="mb-6 flex items-center justify-center gap-2 sm:gap-4">
                    {/* Left 4 */}
                    <span
                        className="select-none font-black leading-none text-white drop-shadow-[0_0_60px_rgba(99,102,241,0.6)]"
                        style={{ fontSize: "clamp(5rem, 15vw, 11rem)" }}
                        aria-hidden="true"
                    >
                        4
                    </span>

                    {/* Center circle – GIF if available, else cinema emoji */}
                    <div className="relative">
                        <div className="pointer-events-none absolute -inset-3 rounded-full bg-indigo-500/30 blur-2xl" />
                        <div
                            className="relative overflow-hidden rounded-full border border-white/15 bg-linear-to-br from-indigo-900/70 to-violet-900/70 backdrop-blur-sm"
                            style={{
                                width: "clamp(6rem, 14vw, 10rem)",
                                height: "clamp(6rem, 14vw, 10rem)",
                                boxShadow: "0 0 70px rgba(99,102,241,0.55), 0 0 120px rgba(139,92,246,0.3)",
                            }}
                        >
                            {/* Drop movie-404.gif into public/ to use it */}
                            {!gifFailed && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src="/movie-404.gif"
                                    alt=""
                                    className="absolute inset-0 h-full w-full object-cover"
                                    onError={() => setGifFailed(true)}
                                />
                            )}
                            <span className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl">
                                🎬
                            </span>
                        </div>
                    </div>

                    {/* Right 4 */}
                    <span
                        className="select-none font-black leading-none text-white drop-shadow-[0_0_60px_rgba(99,102,241,0.6)]"
                        style={{ fontSize: "clamp(5rem, 15vw, 11rem)" }}
                        aria-hidden="true"
                    >
                        4
                    </span>
                </div>

                {/* Subtitle */}
                <h2 className="mb-3 text-xl font-semibold text-white sm:text-2xl md:text-[1.65rem]">
                    It looks like something went wrong.
                </h2>

                <p className="mb-8 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
                    Don&apos;t worry, you&apos;re not going anywhere. This scene was cut from production — the reel broke somewhere.
                    Head back home and find your next favourite film.
                </p>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-slate-900 shadow-[0_8px_30px_rgba(255,255,255,0.18)] transition-all hover:bg-white/90 hover:shadow-[0_8px_36px_rgba(255,255,255,0.28)]"
                    >
                        <Home className="size-4" />
                        Go to home
                    </Link>
                    <Link
                        href="/popular"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/8 px-7 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/14"
                    >
                        <Film className="size-4" />
                        Browse movies
                    </Link>
                </div>
            </div>
        </main>
    )
}
