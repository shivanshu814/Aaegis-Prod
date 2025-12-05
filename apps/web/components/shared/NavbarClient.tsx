"use client";

import WalletConnect from "@/modules/wallet/components/WalletConnect";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function NavbarClient() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { connected } = useWallet();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Portfolio", href: "/portfolio" },
    { name: "Borrow", href: "/lend" },
    { name: "Redeem", href: "/redeem" },
    { name: "Vault", href: "/vaults" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/10 py-3"
            : "bg-transparent py-5"
          }`}
      >
        <div className="w-full px-4 mx-auto max-w-7xl flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/logo-mark-protocol.svg"
                alt="Aaegis Finance"
                className="h-9 w-9 rounded-xl"
                onError={(e) => {
                  // Fallback if logo doesn't load
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white leading-none">
                  Aaegis
                </span>
                <span className="text-xs font-medium text-cyan-400/80 tracking-wider">
                  FINANCE
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <nav className="flex items-center p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                        ? "text-white bg-white/10 shadow-lg shadow-white/5"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <Link
                href="https://docs-aaegis-protocol.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-white/60 hover:text-white transition-colors mr-4"
              >
                Docs
              </Link>
            </div>

            {/* Styled Wallet Button */}
            <WalletConnect />

            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-gray-900 border-l border-white/10 p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="text-white font-bold">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="https://docs-aaegis-protocol.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              >
                Docs
              </Link>
            </nav>

            {/* Mobile Wallet Button */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="w-full">
                <WalletConnect />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
