import Image from "next/image";
import {
    BadgeCheck,
    CalendarDays,
    CircleUserRound,
    CreditCard,
    Film,
    Mail,
    MessageSquare,
    Star,
    Swords,
    UserCircle,
    ImageIcon,
    Clock,
    ShieldCheck,
} from "lucide-react";
import { UserPageShell } from "@/components/user/user-page-shell";
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

function formatRoleLabel(value?: string) {
    if (!value) return "Unknown";
    return value
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function roleBadgeClass(role: string) {
    if (role === "ADMIN") return "bg-rose-100 text-rose-700 border-rose-200";
    if (role === "PREMIUM_USER") return "bg-violet-100 text-violet-700 border-violet-200";
    return "bg-sky-100 text-sky-700 border-sky-200";
}

function StatusDot({ active }: { active: boolean }) {
    return (
        <span className={`inline-block h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
    );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: string }) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent ?? "bg-slate-100 text-slate-600"}`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
            <span className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
            <span className="flex items-center gap-1.5 text-sm text-slate-800">
                {icon}
                {value}
            </span>
        </div>
    );
}

function SectionTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
    if (rows.length === 0) return <p className="text-sm text-slate-400">No records found.</p>;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-200">
                        {headers.map((h) => (
                            <th key={h} className="py-2 pr-6 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-b border-slate-100 transition hover:bg-slate-50">
                            {row.map((cell, j) => (
                                <td key={j} className="py-2.5 pr-6 text-slate-700">{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default async function UserProfilePage() {
    let profile: IUserProfile | null = null;

    try {
        profile = await getMyProfile();
    } catch {
        profile = null;
    }

    if (!profile) {
        return (
            <UserPageShell activePath="/user/profile" title="My Profile" subtitle="Your account information and activity summary.">
                <div className="flex min-h-60 items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-slate-400 shadow-sm">
                    <div className="text-center">
                        <CircleUserRound className="mx-auto mb-3 h-10 w-10 opacity-40" />
                        <p className="text-sm">Could not load profile. Please try again.</p>
                    </div>
                </div>
            </UserPageShell>
        );
    }

    const initials = profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const movieCount = profile.movies?.length ?? 0;
    const contributionCount = profile.movieContributions?.length ?? 0;
    const reviewCount = profile.reviews?.length ?? 0;
    const commentCount = profile.comments?.length ?? 0;
    const paymentCount = profile.payments?.length ?? 0;

    return (
        <UserPageShell activePath="/user/profile" title="My Profile" subtitle="Your account information and activity summary.">
            <div className="space-y-5">
                {/* Identity Card */}
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                        <div className="relative h-24 w-24 shrink-0">
                            {profile.image ? (
                                <Image
                                    src={profile.image}
                                    alt={profile.name}
                                    fill
                                    className="rounded-2xl object-cover ring-2 ring-slate-200"
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-bold text-white ring-2 ring-slate-200">
                                    {initials}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-2xl font-semibold text-slate-900">{profile.name}</h2>
                                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass(profile.role)}`}>
                                    {formatRoleLabel(profile.role)}
                                </span>
                                {profile.emailVerified && (
                                    <span title="Email verified" className="text-emerald-500">
                                        <BadgeCheck className="h-5 w-5" />
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 divide-y divide-slate-100 pt-1">
                                <InfoRow
                                    icon={<Mail className="h-3.5 w-3.5 text-slate-400" />}
                                    label="Email"
                                    value={profile.email}
                                />
                                <div className="pt-2">
                                    <InfoRow
                                        icon={<StatusDot active={profile.status === "ACTIVE"} />}
                                        label="Status"
                                        value={profile.status ?? "Unknown"}
                                    />
                                </div>
                                <div className="pt-2">
                                    <InfoRow
                                        icon={<CalendarDays className="h-3.5 w-3.5 text-slate-400" />}
                                        label="Joined"
                                        value={formatDate(profile.createdAt)}
                                    />
                                </div>
                                <div className="pt-2">
                                    <InfoRow
                                        icon={<Clock className="h-3.5 w-3.5 text-slate-400" />}
                                        label="Last updated"
                                        value={formatDate(profile.updatedAt)}
                                    />
                                </div>
                                <div className="pt-2">
                                    <InfoRow
                                        icon={<ImageIcon className="h-3.5 w-3.5 text-slate-400" />}
                                        label="Profile Photo"
                                        value={profile.image ? "Uploaded" : "Not uploaded"}
                                    />
                                </div>
                                <div className="pt-2">
                                    <InfoRow
                                        icon={<ShieldCheck className="h-3.5 w-3.5 text-slate-400" />}
                                        label="Account"
                                        value={profile.isDeleted ? "Marked deleted" : "Active record"}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stat Cards */}
                <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <StatCard icon={<Film className="h-5 w-5" />} label="Movies" value={movieCount} accent="bg-indigo-100 text-indigo-600" />
                    <StatCard icon={<Swords className="h-5 w-5" />} label="Contributions" value={contributionCount} accent="bg-amber-100 text-amber-600" />
                    <StatCard icon={<Star className="h-5 w-5" />} label="Reviews" value={reviewCount} accent="bg-yellow-100 text-yellow-600" />
                    <StatCard icon={<MessageSquare className="h-5 w-5" />} label="Comments" value={commentCount} accent="bg-cyan-100 text-cyan-600" />
                    <StatCard icon={<CreditCard className="h-5 w-5" />} label="Payments" value={paymentCount} accent="bg-emerald-100 text-emerald-600" />
                </section>

                {/* Movies Table */}
                {movieCount > 0 && (
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                            <Film className="h-4 w-4 text-indigo-500" />
                            Movies ({movieCount})
                        </h2>
                        <SectionTable
                            headers={["Title", "Genre", "Year", "Rating", "Status"]}
                            rows={profile.movies.slice(0, 15).map((m) => [
                                m.title ?? "—",
                                (m.genre as string) ?? "—",
                                String(m.releaseYear ?? "—"),
                                m.rating != null ? String(m.rating) : "—",
                                m.status ?? "—",
                            ])}
                        />
                    </section>
                )}

                {/* Contributions Table */}
                {contributionCount > 0 && (
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                            <Swords className="h-4 w-4 text-amber-500" />
                            Contributions ({contributionCount})
                        </h2>
                        <SectionTable
                            headers={["Title", "Status", "Date"]}
                            rows={profile.movieContributions!.slice(0, 15).map((c) => [
                                c.title ?? "—",
                                c.status ?? "—",
                                formatDate(c.createdAt),
                            ])}
                        />
                    </section>
                )}

                {/* Reviews Table */}
                {reviewCount > 0 && (
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                            <Star className="h-4 w-4 text-yellow-500" />
                            Reviews ({reviewCount})
                        </h2>
                        <SectionTable
                            headers={["Content", "Rating", "Spoiler", "Status", "Date"]}
                            rows={profile.reviews!.slice(0, 15).map((r) => [
                                <span key={r.id} className="line-clamp-1 max-w-xs">{r.content ?? "—"}</span>,
                                r.rating != null ? String(r.rating) : "—",
                                r.spoiler ? "Yes" : "No",
                                r.status ?? "—",
                                formatDate(r.createdAt),
                            ])}
                        />
                    </section>
                )}

                {/* Payments Table */}
                {paymentCount > 0 && (
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                            <CreditCard className="h-4 w-4 text-emerald-500" />
                            Payments ({paymentCount})
                        </h2>
                        <SectionTable
                            headers={["Amount", "Method", "Status", "Date"]}
                            rows={profile.payments!.slice(0, 15).map((p) => [
                                p.amount != null ? `$${p.amount}` : "—",
                                p.method ?? "—",
                                p.status ?? "—",
                                formatDate(p.createdAt),
                            ])}
                        />
                    </section>
                )}
            </div>
        </UserPageShell>
    );
}
