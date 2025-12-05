"use client";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAegis } from "../providers/aegis-sdk";

export default function VaultsPage() {
  const { client } = useAegis();
  const wallet = useAnchorWallet();
  const router = useRouter();
  const [vaults, setVaults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVaults();
  }, [client]);

  const fetchVaults = async () => {
    if (!client) return;
    try {
      setLoading(true);
      const allVaults = await client.fetchAllVaultTypes();
      setVaults(allVaults.filter(v => v.account.isActive));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              AEGIS
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              {wallet && (
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Vault
          </h1>
          <p className="text-xl text-gray-400">
            Select a collateral type to start minting AUSD stablecoins
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Loading vaults...</p>
          </div>
        ) : vaults.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏦</div>
            <p className="text-xl text-gray-400">No active vaults available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaults.map((vault) => {
              const ltv = (vault.account.ltvBps / 100).toFixed(1);
              const liqThreshold = (vault.account.liqThresholdBps / 100).toFixed(1);
              const stabilityFee = (vault.account.stabilityFeeBps / 100).toFixed(2);

              return (
                <div
                  key={vault.publicKey.toString()}
                  className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-xl hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1 cursor-pointer"
                  onClick={() => router.push(`/vault/${vault.publicKey.toString()}`)}
                >
                  {/* Collateral Badge */}
                  <div className="absolute -top-3 -right-3 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-semibold shadow-lg">
                    Active
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-6 text-4xl group-hover:scale-110 transition-transform">
                    💎
                  </div>

                  {/* Collateral Mint */}
                  <h3 className="text-xl font-bold text-white mb-2">
                    Collateral Vault
                  </h3>
                  <p className="text-sm text-gray-500 font-mono mb-6 truncate">
                    {vault.account.collateralMint.toString()}
                  </p>

                  {/* Stats Grid */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Max LTV</span>
                      <span className="text-sm font-semibold text-cyan-400">{ltv}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Liq. Threshold</span>
                      <span className="text-sm font-semibold text-yellow-400">{liqThreshold}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Stability Fee</span>
                      <span className="text-sm font-semibold text-purple-400">{stabilityFee}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Debt Ceiling</span>
                      <span className="text-sm font-semibold text-white">
                        ${(vault.account.vaultDebtCeiling / 1_000_000).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/vault/${vault.publicKey.toString()}`);
                    }}
                  >
                    Open Vault →
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <h3 className="text-2xl font-bold text-white mb-4">How it Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-3xl mb-2">1️⃣</div>
              <h4 className="font-semibold text-white mb-2">Select Vault</h4>
              <p className="text-gray-400">Choose a collateral type that you want to deposit</p>
            </div>
            <div>
              <div className="text-3xl mb-2">2️⃣</div>
              <h4 className="font-semibold text-white mb-2">Deposit Collateral</h4>
              <p className="text-gray-400">Lock your assets to secure your position</p>
            </div>
            <div>
              <div className="text-3xl mb-2">3️⃣</div>
              <h4 className="font-semibold text-white mb-2">Mint AUSD</h4>
              <p className="text-gray-400">Borrow stablecoins up to your collateral limit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
