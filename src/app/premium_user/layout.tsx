import { RoleDashboardShell } from "@/components/role-dashboard-shell";

export default function PremiumUserProtectedLayout({ children }: { children: React.ReactNode }) {
    return <RoleDashboardShell role="PREMIUM_USER">{children}</RoleDashboardShell>;
}