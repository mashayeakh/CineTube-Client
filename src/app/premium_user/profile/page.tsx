import Image from "next/image";
import { PremiumPageShell } from "@/components/premium/premium-page-shell";
import { getMyProfile } from "@/service/profile.services";

function formatDate(value?: string) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default async function PremiumProfilePage() {
    let profile: Awaited<ReturnType<typeof getMyProfile>> | null = null;

    try {
        profile = await getMyProfile();
    } catch {
        profile = null;
    }

    const initials = (profile?.name ?? "User")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <PremiumPageShell
            activePath="/premium_user/profile"
            title="My Profile"
            subtitle="Data from GET /api/v1/auth/user/profile"
        >
            {profile ? (
                <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative h-20 w-20 shrink-0">
                            {profile.image ? (
                                <Image
                                    src={profile.image}
                                    alt={profile.name}
                                    fill
                                    className="rounded-2xl object-cover"
                                />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-fuchsia-500 to-indigo-600 text-2xl font-semibold text-white">
                                    {initials}
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold text-slate-900">{profile.name}</h2>
                            <p className="text-sm text-slate-600">{profile.email}</p>
                            <p className="mt-1 text-xs text-slate-500">Role: {profile.role}</p>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-500">Status</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{profile.status ?? "Unknown"}</p>
                        </article>
                        <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-500">Email Verified</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{profile.emailVerified ? "Yes" : "No"}</p>
                        </article>
                        <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-500">Joined</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(profile.createdAt)}</p>
                        </article>
                        <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-500">Updated</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(profile.updatedAt)}</p>
                        </article>
                    </div>
                </section>
            ) : (
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Unable to load profile data.</p>
                </section>
            )}
        </PremiumPageShell>
    );
}