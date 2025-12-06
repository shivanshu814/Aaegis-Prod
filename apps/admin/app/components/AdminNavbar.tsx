"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/", label: "Dashboard", icon: "📊" },
    { href: "/admin/protocol", label: "Protocol", icon: "⚡" },
    { href: "/admin/vaults", label: "Vaults", icon: "🏦" },
    { href: "/admin/positions", label: "Positions", icon: "📈" },
    { href: "/admin/alerts", label: "Alerts", icon: "🔔" },
    { href: "/admin/fees", label: "Fees", icon: "💰" },
    { href: "/admin/oracles", label: "Oracles", icon: "🔮" },
    { href: "/admin/tokens", label: "Tokens", icon: "🪙" },
];

export default function AdminNavbar() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                            <span className="text-xl font-bold text-black">A</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                Aegis Admin
                            </h1>
                            <p className="text-xs text-gray-500">Protocol Dashboard</p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== "/" && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                                        transition-all duration-200 whitespace-nowrap
                                        ${isActive
                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                                        }
                                    `}
                                >
                                    <span className="text-base">{item.icon}</span>
                                    <span className="hidden md:inline">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Status Indicator */}
                    <div className="hidden lg:flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs text-emerald-400 font-medium">Devnet</span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
