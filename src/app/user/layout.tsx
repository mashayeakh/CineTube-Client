import { DataRefreshButton } from "@/components/data-refresh-button";

export const dynamic = "force-dynamic";

export default function UserProtectedLayout({ children }: { children: React.ReactNode }) {
    return <>{children}<DataRefreshButton /></>;
}