// app/layout.tsx
"use client"; // needed for useSession

import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { usePathname } from "next/navigation";
import "../globals.css";
import { Navbar } from "@/components/navbar";
import Heading from "@/components/ui/modules/home/heading";

// import { Navbar } from "@/src/components/layout/navbar";


const fraunces = Fraunces({
    variable: "--font-serif",
    subsets: ["latin"],
    display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
    variable: "--font-sans",
    subsets: ["latin"],
    display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const hidePublicChrome = pathname === "/login" || pathname === "/signup";

    // const { data: session } = authClient.useSession();
    // const hideNavbar = !!session?.user?.role;

    return (
        <div className="scroll-smooth">
            <div
                className={`${plusJakartaSans.variable} ${fraunces.variable} font-sans antialiased bg-cream text-charcoal min-h-full flex flex-col`}
            >
                {/* {!hideNavbar && <Navbar />} */}
                {!hidePublicChrome && <Heading />}
                {!hidePublicChrome && <Navbar />}
                {children}
                {/* <Footer2 /> */}
                {/* <Toaster richColors position="top-center" /> */}
            </div>
        </div>
    );

}
