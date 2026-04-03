import { DataRefreshButton } from "@/components/data-refresh-button";

export const dynamic = "force-dynamic";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
    return <>{children}<DataRefreshButton /></>;
}