import Link from "next/link";
import { Sparkles, Users, Trophy } from "lucide-react";

const stats = [
    { label: "Members", value: "18K+", icon: Users },
    { label: "Awards", value: "23", icon: Trophy },
    { label: "Highlights", value: "120+", icon: Sparkles },
];

export default function CommunitySection() {
    return (
        <section className="py-16 bg-background text-foreground">
            <div className="container mx-auto px-4">
                <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            Community
                        </p>
                        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                            Join a passionate audience of cinema lovers
                        </h2>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                            Get recommendations, share your reviews, and explore films together with a growing community of movie fans.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/signup"
                                className="inline-flex items-center rounded-full border border-border bg-muted px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/80"
                            >
                                Join now
                            </Link>
                            <Link
                                href="/about"
                                className="inline-flex items-center rounded-full border border-border bg-muted/50 px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/80"
                            >
                                About CineTube
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {stats.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className="rounded-[2rem] border border-border bg-card p-6">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-muted/40 text-foreground">
                                        <Icon className="size-6" />
                                    </div>
                                    <p className="mt-5 text-3xl font-semibold">{item.value}</p>
                                    <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
