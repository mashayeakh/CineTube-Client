import Image from "next/image";
import {
    BadgeCheck,
    CalendarDays,
    CircleUserRound,
    CreditCard,
    Film,
    Mail,
    MessageSquare,
    Shield,
    Star,
    Swords,
    User,
} from "lucide-react";
import { getMyProfile } from "@/service/profile.services";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { IUserProfile } from "@/types/auth.types";

function formatDate(value?: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function roleBadgeVariant(role: string): "default" | "secondary" | "destructive" | "outline" {
    if (role === "ADMIN") return "destructive";
    if (role === "PREMIUM_USER") return "default";
    return "secondary";
}

function StatusDot({ status }: { status?: string | null }) {
    const active = status === "ACTIVE";
    return (
        <span
            className={`inline-block h-2 w-2 rounded-full ${active ? "bg-emerald-400" : "bg-slate-500"}`}
            aria-hidden="true"
        />
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-slate-300">
                {icon}
            </div>
            <div>
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
            </div>
        </div>
    );
}

function SectionTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
    if (rows.length === 0) {
        return <p className="text-sm text-slate-500">No records found.</p>;
    }
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-white/10">
                        {headers.map((h) => (
                            <th key={h} className="py-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            {row.map((cell, j) => (
                                <td key={j} className="py-2 pr-4 text-slate-300">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function AdminInfo({ profile }: { profile: IUserProfile }) {
    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <Shield className="h-4 w-4 text-rose-400" />
                    Admin Privileges
                </h3>
                <p className="text-sm text-slate-400">
                    Admin since{" "}
                    <span className="text-white">{formatDate(profile.admin?.createdAt)}</span>
                </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <Film className="h-4 w-4 text-indigo-400" />
                    Movies ({profile.movies.length})
                </h3>
                <SectionTable
                    headers={["Title", "Genre", "Release Year", "Status"]}
                    rows={profile.movies.slice(0, 10).map((m) => [
                        m.title ?? "—",
                        (m.genre as string) ?? "—",
                        String(m.releaseYear ?? "—"),
                        m.status ?? "—",
                    ])}
                />
            </div>
        </div>
    );
}

function UserInfo({ profile }: { profile: IUserProfile }) {
    return (
        <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={<Film className="h-5 w-5" />} label="Movies" value={profile.movies.length} />
                <StatCard icon={<Swords className="h-5 w-5" />} label="Contributions" value={profile.movieContributions?.length ?? 0} />
                <StatCard icon={<Star className="h-5 w-5" />} label="Reviews" value={profile.reviews?.length ?? 0} />
                <StatCard icon={<MessageSquare className="h-5 w-5" />} label="Comments" value={profile.comments?.length ?? 0} />
            </div>

            {(profile.movieContributions?.length ?? 0) > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <Swords className="h-4 w-4 text-amber-400" />
                        Movie Contributions ({profile.movieContributions!.length})
                    </h3>
                    <SectionTable
                        headers={["Title", "Status", "Date"]}
                        rows={profile.movieContributions!.slice(0, 10).map((c) => [
                            c.title ?? "—",
                            c.status ?? "—",
                            formatDate(c.createdAt),
                        ])}
                    />
                </div>
            )}

            {(profile.reviews?.length ?? 0) > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <Star className="h-4 w-4 text-yellow-400" />
                        Reviews ({profile.reviews!.length})
                    </h3>
                    <SectionTable
                        headers={["Content", "Rating", "Spoiler", "Status", "Date"]}
                        rows={profile.reviews!.slice(0, 10).map((r) => [
                            <span key={r.id} className="line-clamp-1 max-w-xs">{r.content ?? "—"}</span>,
                            r.rating != null ? String(r.rating) : "—",
                            r.spoiler ? "Yes" : "No",
                            r.status ?? "—",
                            formatDate(r.createdAt),
                        ])}
                    />
                </div>
            )}

            {(profile.payments?.length ?? 0) > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <CreditCard className="h-4 w-4 text-emerald-400" />
                        Payments ({profile.payments!.length})
                    </h3>
                    <SectionTable
                        headers={["Amount", "Method", "Status", "Date"]}
                        rows={profile.payments!.slice(0, 10).map((p) => [
                            p.amount != null ? `$${p.amount}` : "—",
                            p.method ?? "—",
                            p.status ?? "—",
                            formatDate(p.createdAt),
                        ])}
                    />
                </div>
            )}
        </div>
    );
}

export default async function MyProfilePage() {
    let profile: IUserProfile | null = null;

    try {
        profile = await getMyProfile();
    } catch {
        // handled below
    }

    if (!profile) {
        return (
            <div className="flex min-h-50 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8 text-slate-400">
                <div className="text-center">
                    <CircleUserRound className="mx-auto mb-3 h-10 w-10 opacity-40" />
                    <p className="text-sm">Could not load profile. Please try again.</p>
                </div>
            </div>
        );
    }

    const isAdmin = profile.role === "ADMIN";
    const initials = profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="space-y-6">
            {/* Profile header */}
            <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-6 sm:flex-row sm:items-center">
                <div className="relative h-20 w-20 shrink-0">
                    {profile.image ? (
                        <Image
                            src={profile.image}
                            alt={profile.name}
                            fill
                            className="rounded-full object-cover ring-2 ring-white/20"
                        />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white ring-2 ring-white/20">
                            {initials}
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold text-white">{profile.name}</h2>
                        <Badge variant={roleBadgeVariant(profile.role)} className="text-xs">
                            {profile.role}
                        </Badge>
                        {profile.emailVerified && (
                            <span title="Email verified" className="text-emerald-400">
                                <BadgeCheck className="h-4 w-4" />
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            {profile.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <StatusDot status={profile.status} />
                            {profile.status ?? "Unknown"}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Joined {formatDate(profile.createdAt)}
                        </span>
                    </div>
                </div>
            </div>

            <Separator className="border-white/10" />

            {/* Role-specific content */}
            {isAdmin ? (
                <AdminInfo profile={profile} />
            ) : (
                <UserInfo profile={profile} />
            )}
        </div>
    );
}