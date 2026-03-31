import { redirect } from "next/navigation";

export default function PremiumUserProtectedLayout({ children }: { children: React.ReactNode }) {
    redirect("/user/dashboard");
    return <>{children}</>;
}