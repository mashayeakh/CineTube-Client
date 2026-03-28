import type { Metadata } from "next";
import { Funnel_Sans, Geist, Geist_Mono, Lato } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import QueryProviders from "@/providers/queryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const funnelSans = Funnel_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '700', '800'], // pick weights you need
  variable: '--font-heading',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900'],
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
    <html className={`${funnelSans.variable} ${lato.variable} h-full antialiased `}>
      {/* <body className="min-h-full flex flex-col bg-[#F6F930]"> */}
      <body className="min-h-full flex flex-col ">
        {/* <Navbar /> */}
        <QueryProviders>
          {children}
        </QueryProviders>
        <Footer className="flex justify-center px-28 body-font" />
      </body>
    </html>
  );
}