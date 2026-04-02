import Image from "next/image";
import Link from "next/link";
import {
    BadgeCheck,
    Bell,
    CalendarDays,
    CircleUserRound,
    CreditCard,
    Film,
    Home,
    Mail,
    MessageSquare,
    Shield,
    Star,
    Swords,
} from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getMyProfile } from "@/service/profile.services";
import type { IUserProfile, IMovie, IMovieContribution, IReview, IPayment } from "@/types/auth.types";

function formatDate(value?: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function roleBadgeClass(role: string) {
    if (role === "ADMIN") return "bg-rose-100 text-rose-700 border-rose-200";
    if (role === "PREMIUM_USER") return "bg-violet-100 text-violet-700 border-violet-200";
    return "bg-sky-100 text-sky-700 border-sky-200";
}

function StatusDot({ status }: { status?: string | null }) {
    const active = status === "ACTIVE";
    return (
        <span
            className={`inline-block h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`}
        />
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
            </div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
            <span className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
            <span className="text-sm text-slate-800">{value}</span>
        </div>
    );
}

function SectionTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
    if (rows.length === 0) {
        return <p className="text-sm text-slate-400">No records found.</p>;
    }
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-200">
                        {headers.map((h) => (
                            <th
                                key={h}
                                className="py-2 pr-6 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                            {row.map((cell, j) => (
                                <td key={j} className="py-2.5 pr-6 text-slate-700">
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

function MovieTable({ movies }: { movies: IMovie[] }) {
    return (
        <SectionTable
            headers={["Title", "Genre", "Year", "Rating", "Status"]}
            rows={movies.slice(0, 15).map((m) => [
                m.title ?? "—",
                (m.genre as string) ?? "—",
                String(m.releaseYear ?? "—"),
                m.rating != null ? String(m.rating) : "—",
                m.status ?? "—",
            ])}
        />
    );
}

function ContributionTable({ items }: { items: IMovieContribution[] }) {
    return (
        <SectionTable
            headers={["Title", "Status", "Date"]}
            rows={items.slice(0, 15).map((c) => [
                c.title ?? "—",
                c.status ?? "—",
                formatDate(c.createdAt),
            ])}
        />
    );
}

function ReviewTable({ items }: { items: IReview[] }) {
    return (
        <SectionTable
            headers={["Content", "Rating", "Spoiler", "Status", "Date"]}
            rows={items.slice(0, 15).map((r) => [
                <span key={r.id} className="line-clamp-1 max-w-xs">{r.content ?? "—"}</span>,
                r.rating != null ? String(r.rating) : "—",
                r.spoiler ? "Yes" : "No",
                r.status ?? "—",
                formatDate(r.createdAt),
            ])}
        />
    );
}

function PaymentTable({ items }: { items: IPayment[] }) {
    return (
        <SectionTable
            headers={["Amount", "Method", "Status", "Date"]}
            rows={items.slice(0, 15).map((p) => [
                p.amount != null ? `$${p.amount}` : "—",
                p.method ?? "—",
                p.status ?? "—",
                formatDate(p.createdAt),
            ])}
        />
    );
}

function ProfileBody({ profile }: { profile: IUserProfile }) {
    const isAdmin = profile.role === "ADMIN";
    const initials = profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="mx-auto max-w-5xl space-y-5">
            {/* Page header */}
            <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Admin / Profile</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">My Profile</h1>
                <p className="mt-1 text-sm text-slate-500">Your account information and activity summary.</p>
            </header>

            {/* Identity card */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                    {/* Avatar */}
                    <div className="relative h-24 w-24 shrink-0">
                        {profile.image ? (
                            <Image
                                src={profile.image}
                                alt={profile.name}
                                fill
                                className="rounded-2xl object-cover ring-2 ring-slate-200"
                            />
                        ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 text-3xl font-bold text-white ring-2 ring-slate-200">
                                {initials}
                            </div>
                        )}
                    </div>

                    {/* Core details */}
                    <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-2xl font-semibold text-slate-900">{profile.name}</h2>
                            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass(profile.role)}`}>
                                {profile.role}
                            </span>
                            {profile.emailVerified && (
                                <span title="Email verified" className="text-emerald-500">
                                    <BadgeCheck className="h-5 w-5" />
                                </span>
                            )}
                        </div>

                        <div className="space-y-2 divide-y divide-slate-100 pt-1">
                            <InfoRow label="Email" value={
                                <span className="flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                                    {profile.email}
                                </span>
                            } />
                            <div className="pt-2">
                                <InfoRow label="Status" value={
                                    <span className="flex items-center gap-1.5">
                                        <StatusDot status={profile.status} />
                                        {profile.status ?? "Unknown"}
                                    </span>
                                } />
                            </div>
                            <div className="pt-2">
                                <InfoRow label="Joined" value={
                                    <span className="flex items-center gap-1.5">
                                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                                        {formatDate(profile.createdAt)}
                                    </span>
                                } />
                            </div>
                            <div className="pt-2">
                                <InfoRow label="Last updated" value={formatDate(profile.updatedAt)} />
                            </div>
                            {isAdmin && profile.admin && (
                                <div className="pt-2">
                                    <InfoRow
                                        label="Admin since"
                                        value={
                                            <span className="flex items-center gap-1.5">
                                                <Shield className="h-3.5 w-3.5 text-rose-400" />
                                                {formatDate(profile.admin.createdAt)}
                                            </span>
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard icon={<Film className="h-5 w-5" />} label="Movies" value={profile.movies.length} />
                {!isAdmin && (
                    <>
                        <StatCard icon={<Swords className="h-5 w-5" />} label="Contributions" value={profile.movieContributions?.length ?? 0} />
                        <StatCard icon={<Star className="h-5 w-5" />} label="Reviews" value={profile.reviews?.length ?? 0} />
                        <StatCard icon={<MessageSquare className="h-5 w-5" />} label="Comments" value={profile.comments?.length ?? 0} />
                    </>
                )}
            </section>

            {/* Movies */}
            {profile.movies.length > 0 && (
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                        <Film className="h-4 w-4 text-indigo-500" />
                        Movies ({profile.movies.length})
                    </h2>
                    <MovieTable movies={profile.movies} />
                </section>
            )}

            {/* Contributions – non-admin */}
            {!isAdmin && (profile.movieContributions?.length ?? 0) > 0 && (
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                        <Swords className="h-4 w-4 text-amber-500" />
                        Movie Contributions ({profile.movieContributions!.length})
                    </h2>
                    <ContributionTable items={profile.movieContributions!} />
                </section>
            )}

            {/* Reviews – non-admin */}
            {!isAdmin && (profile.reviews?.length ?? 0) > 0 && (
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Reviews ({profile.reviews!.length})
                    </h2>
                    <ReviewTable items={profile.reviews!} />
                </section>
            )}

            {/* Payments – non-admin */}
            {!isAdmin && (profile.payments?.length ?? 0) > 0 && (
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                        <CreditCard className="h-4 w-4 text-emerald-500" />
                        Payments ({profile.payments!.length})
                    </h2>
                    <PaymentTable items={profile.payments!} />
                </section>
            )}
        </div>
    );
}

export default async function AdminProfilePage() {
    let profile: IUserProfile | null = null;

    try {
        profile = await getMyProfile();
    } catch {
        // handled below
    }

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/profile" />

                <div className="min-w-0">
                    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-slate-50/95 px-4 backdrop-blur sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Admin Console</p>
                            <p className="text-xs text-slate-500">My Profile</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-700" type="button">
                                <Bell className="size-4" />
                            </button> */}
                            <Link href="/admin/dashboard" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-700">
                                <Home className="size-4" />
                            </Link>
                        </div>
                    </header>

                    <main className="p-4 sm:p-6">
                        {profile ? (
                            <ProfileBody profile={profile} />
                        ) : (
                            <div className="flex min-h-60 items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-slate-400 shadow-sm">
                                <div className="text-center">
                                    <CircleUserRound className="mx-auto mb-3 h-10 w-10 opacity-40" />
                                    <p className="text-sm">Could not load profile. Please try again.</p>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
