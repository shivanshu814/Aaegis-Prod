import NavbarClient from "@/components/shared/NavbarClient";
import Providers from "@/providers";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://app-aaegis-protocol.vercel.app/"),
  title: {
    default: "Aaegis Finance — Revolutionary Decentralized Stablecoin",
    template: "%s | Aaegis Finance",
  },
  description:
    "Aaegis Finance is a revolutionary decentralized stablecoin protocol on Solana with Adaptive Liquidation Algorithm — mint, redeem, and manage collateral securely.",
  keywords: [
    "aaegis finance",
    "aaegis protocol",
    "ags stablecoin",
    "decentralized stablecoin",
    "adaptive liquidation algorithm",
    "solana stablecoin",
    "crypto",
    "mint",
    "redeem",
  ],
  authors: [
    {
      name: "Aaegis Finance Team",
      url: "https://app-aaegis-protocol.vercel.app/",
    },
  ],
  openGraph: {
    title: "Aaegis Finance — Revolutionary Decentralized Stablecoin",
    description:
      "Mint and redeem with Aaegis Finance — a revolutionary decentralized stablecoin protocol on Solana with Adaptive Liquidation Algorithm.",
    url: "https://app-aaegis-protocol.vercel.app/",
    siteName: "Aaegis Finance",
    images: [
      {
        url: "/logo-full-protocol.svg",
        width: 1200,
        height: 630,
        alt: "Aaegis Finance logo",
      },
    ],
    type: "website",
  },
  icons: {
    icon: "/favicon-protocol.svg",
    shortcut: "/favicon-protocol.svg",
    apple: "/favicon-protocol.svg",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-black`}
      >
        <Providers>
          <Suspense fallback={null}>
            {/* Background accents */}
            <div
              className="fixed inset-0 -z-10 bg-[radial-gradient(1000px_600px_at_top_left,rgba(34,211,238,0.08),transparent_60%)]"
              aria-hidden="true"
            />
            <div
              className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(1000px_600px_at_bottom_right,rgba(217,70,239,0.08),transparent_60%)]"
              aria-hidden="true"
            />

            {/* Navigation (client) */}
            <NavbarClient />

            {/* Main Content */}
            <main className="min-h-[60dvh]">{children}</main>
          </Suspense>
          <Toaster position="bottom-right" richColors expand={true} />
        </Providers>
      </body>
    </html>
  );
}
