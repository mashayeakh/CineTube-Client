import { redirect } from "next/navigation";

export default function PremiumUserRootPage() {
    redirect("/user/dashboard");
}