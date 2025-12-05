"use client";

import { WalletName } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { Check, ChevronDown, Copy, CreditCard, ExternalLink, LogOut, Wallet, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function WalletConnect() {
    const { select, wallets, publicKey, disconnect, connected, connecting } = useWallet();
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleConnect = (walletName: WalletName) => {
        select(walletName);
        setIsOpen(false);
    };

    const handleCopy = () => {
        if (publicKey) {
            navigator.clipboard.writeText(publicKey.toBase58());
            setCopied(true);
            toast.success("Address copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (connected && publicKey) {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30 group-hover:border-cyan-500/50 transition-colors">
                        <Wallet className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex flex-col items-start hidden sm:flex">
                        <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Connected</span>
                        <span className="text-sm font-bold text-white font-mono leading-none mt-0.5">
                            {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                        </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0A0A0A] border border-white/10 shadow-2xl p-4 z-50 animate-scale-in origin-top-right backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-white/60">Active Account</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                                Online
                            </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-4 group hover:border-white/20 transition-colors relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-white/40">Wallet Address</span>
                                    <button
                                        onClick={handleCopy}
                                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <div className="font-mono text-sm text-white break-all bg-black/20 p-2 rounded-lg border border-white/5">
                                    {publicKey.toBase58()}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <a
                                href={`https://solscan.io/account/${publicKey.toBase58()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors group"
                            >
                                <ExternalLink className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
                                View on Explorer
                            </a>

                            <button
                                onClick={() => {
                                    disconnect();
                                    setIsOpen(false);
                                }}
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors group"
                            >
                                <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                Disconnect Wallet
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={connecting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
                {connecting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Connecting...</span>
                    </>
                ) : (
                    <>
                        <Wallet className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Connect Wallet</span>
                    </>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#0A0A0A] border border-white/10 shadow-2xl p-4 z-50 animate-scale-in origin-top-right backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-cyan-400" />
                            Connect Wallet
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        {wallets.map((wallet) => (
                            <button
                                key={wallet.adapter.name}
                                onClick={() => handleConnect(wallet.adapter.name)}
                                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:via-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />

                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-10 h-10 rounded-lg bg-black/40 p-1.5 flex items-center justify-center border border-white/5 group-hover:border-white/10 group-hover:scale-105 transition-all">
                                        <img
                                            src={wallet.adapter.icon}
                                            alt={wallet.adapter.name}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold text-white group-hover:text-cyan-100 transition-colors">{wallet.adapter.name}</span>
                                        <span className="text-[10px] text-white/40 group-hover:text-white/60 uppercase tracking-wider">
                                            {wallet.readyState === "Installed" ? "Detected" : "Not Detected"}
                                        </span>
                                    </div>
                                </div>
                                {wallet.readyState === "Installed" && (
                                    <div className="relative z-10">
                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 text-center">
                        <p className="text-[10px] text-white/30 leading-relaxed">
                            By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
