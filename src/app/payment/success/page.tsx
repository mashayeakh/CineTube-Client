import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getNewTokensWithRefreshToken } from "@/service/auth.services"

export default async function PaymentSuccessPage() {
    // After payment, the user's role in the DB is upgraded to PREMIUM_USER.
    // Refresh the JWT so the new accessToken contains role: PREMIUM_USER,
    // otherwise backend checkAuth() will still see the old role and return 403.
    try {
        const cookieStore = await cookies()
        const refreshToken = cookieStore.get("refreshToken")?.value
        if (refreshToken) {
            await getNewTokensWithRefreshToken(refreshToken)
        }
    } catch {
        // Best-effort — still redirect even if refresh fails
    }

    redirect("/user/subscription")
}
