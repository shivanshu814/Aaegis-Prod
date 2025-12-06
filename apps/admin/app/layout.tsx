import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import AdminNavbar from "./components/AdminNavbar";
import "./globals.css";
import Providers from "./providers";

// Load fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

// Export metadata
export const metadata: Metadata = {
  title: "Aaegis Finance - Admin",
  description: "Admin dashboard for Aaegis Finance protocol management",
};

// Export root layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-black text-foreground`}>
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
          <Providers>
            <AdminNavbar />
            <main className="min-h-[calc(100vh-4rem)]">
              {children}
            </main>
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}

