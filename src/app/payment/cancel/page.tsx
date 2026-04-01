import { redirect } from "next/navigation"

export default function PaymentCancelPage() {
    redirect("/user/subscription#pricing")
}
