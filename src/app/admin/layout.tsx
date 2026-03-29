import { RoleDashboardShell } from "@/components/role-dashboard-shell";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
    return <RoleDashboardShell role="ADMIN">{children}</RoleDashboardShell>;
}