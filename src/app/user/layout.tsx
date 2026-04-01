import { DataRefreshButton } from "@/components/data-refresh-button";

export default function UserProtectedLayout({ children }: { children: React.ReactNode }) {
    return <>{children}<DataRefreshButton /></>;
}