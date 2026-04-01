import Link from "next/link";
import { DataRefreshButton } from "@/components/data-refresh-button";

export default function CommonProtectedLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.16),transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_50%,#111827_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
			<div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
				<div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Common protected</p>
						<h1 className="mt-2 text-2xl font-semibold">Account settings</h1>
					</div>
					<div className="flex gap-2 text-sm">
						<Link href="/my-profile" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200 transition hover:bg-white/10">
							My profile
						</Link>
						<Link href="/change-password" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200 transition hover:bg-white/10">
							Change password
						</Link>
					</div>
				</div>
				<div className="pt-6">{children}</div>
			</div>
		</div>
		<DataRefreshButton />
	);
}
