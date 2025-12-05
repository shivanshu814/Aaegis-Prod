"use client";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

export default function HomePage() {
  const wallet = useAnchorWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                AEGIS
              </Link>
              <div className="hidden md:flex gap-6">
                <Link href="/vaults" className="text-gray-300 hover:text-white transition-colors">
                  Vaults
                </Link>
                {wallet && (
                  <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
            <WalletMultiButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-32">
          <div className="text-center space-y-8">
            <h1 className="text-6xl md:text-7xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                Decentralized Stablecoin
              </span>
              <br />
              <span className="text-white">Backed by Your Assets</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Mint AUSD stablecoins by depositing collateral. Transparent, secure, and decentralized on Solana.
            </p>

            <div className="flex gap-4 justify-center pt-4">
              <Link 
                href="/vaults"
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 transition-all hover:-translate-y-0.5"
              >
                Open Vault
              </Link>
              <Link 
                href="/dashboard"
                className="px-8 py-4 bg-white/10 backdrop-blur-xl rounded-xl font-semibold text-white border border-white/20 hover:bg-white/20 transition-all hover:-translate-y-0.5"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-16 text-white">
          Why Choose Aegis?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 backdrop-blur-xl">
            <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6 text-3xl">
              ⚡
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Lightning Fast</h3>
            <p className="text-gray-400">
              Built on Solana for instant transactions and minimal fees. Mint and redeem in seconds.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 backdrop-blur-xl">
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 text-3xl">
              🔒
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Fully Secure</h3>
            <p className="text-gray-400">
              Audited smart contracts and over-collateralized positions ensure your assets are always safe.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 backdrop-blur-xl">
            <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6 text-3xl">
              📊
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Transparent</h3>
            <p className="text-gray-400">
              Real-time oracle prices and on-chain verification. Full transparency in every transaction.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                150%
              </div>
              <div className="text-gray-400">Min Collateral Ratio</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">
                0.1%
              </div>
              <div className="text-gray-400">Minting Fee</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-2">
                $1.00
              </div>
              <div className="text-gray-400">AUSD Peg</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-gray-400">Always Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>© 2024 Aegis Protocol. Built on Solana.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-300 transition-colors">Docs</a>
              <a href="#" className="hover:text-gray-300 transition-colors">GitHub</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
