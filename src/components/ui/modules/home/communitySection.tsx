"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Shapes } from "lucide-react";

export default function CommunitySection() {
    return (
        <section className="py-24 bg-background text-foreground relative overflow-hidden" id="community">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />

            <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center">
                <div className="max-w-4xl">
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <Shapes className="size-5 text-primary" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/60">
                            Community
                        </p>
                    </div>
                    <h2 className="text-5xl font-black tracking-tight sm:text-7xl text-foreground leading-[1.05]">
                        Join a passionate audience of cinema lovers
                    </h2>
                    <p className="mt-10 mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground font-medium">
                        Get personalized recommendations, share your deepest film insights, and connect with a global network of movie enthusiasts.
                    </p>
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
                        <Link
                            href="/signup"
                            className="group inline-flex items-center gap-3 rounded-2xl bg-primary px-10 py-6 text-sm font-black uppercase tracking-widest text-primary-foreground shadow-2xl shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/40 active:scale-95"
                        >
                            Join now
                            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            href="/about"
                            className="inline-flex items-center rounded-2xl border border-border bg-card/50 backdrop-blur-sm px-10 py-6 text-sm font-black uppercase tracking-widest text-foreground transition-all hover:bg-muted hover:border-primary/20"
                        >
                            About CineTube
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
