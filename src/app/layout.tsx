/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from "next";
import { Funnel_Sans, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import ConditionalFooter from "@/components/conditional-footer";
import QueryProviders from "@/providers/queryProvider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const funnelSans = Funnel_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '700', '800'], // pick weights you need
  variable: '--font-heading',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: "Cinetube",
  description: "Discover, rate, and review your favorite movies and TV series in one place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${funnelSans.variable} ${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}>
      {/* <body className="min-h-full flex flex-col bg-[#F6F930]"> */}
      <body className="min-h-full flex flex-col body-font">
        {/* <Navbar /> */}
        <QueryProviders>
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </QueryProviders>
        <ConditionalFooter />
      </body>
    </html>
  );
}