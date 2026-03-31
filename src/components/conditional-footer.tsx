"use client"

import { usePathname } from "next/navigation"

import { Footer } from "@/components/footer"

export default function ConditionalFooter() {
    const pathname = usePathname()
    const hideFooter = pathname === "/login" || pathname === "/signup" || pathname === "/forgetPassword" || pathname === "/verify-email"

    if (hideFooter) {
        return null
    }

    return <Footer className="flex justify-center px-28 body-font" />
}
