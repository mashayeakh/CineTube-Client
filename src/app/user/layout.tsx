import { RoleDashboardShell } from "@/components/role-dashboard-shell";

export default function UserProtectedLayout({ children }: { children: React.ReactNode }) {
    return <RoleDashboardShell role="USER">{children}</RoleDashboardShell>;
}