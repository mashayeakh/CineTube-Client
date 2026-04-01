import { DataRefreshButton } from "@/components/data-refresh-button";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
    return <>{children}<DataRefreshButton /></>;
}