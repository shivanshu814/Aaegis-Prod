"use client";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAegis } from "../providers/aegis-sdk";

export default function DashboardPage() {
  const { client } = useAegis();
  const wallet = useAnchorWallet();
  const router = useRouter();
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wallet && client) {
      fetchPositions();
    }
  }, [wallet, client]);

  const fetchPositions = async () => {
    if (!client || !wallet) return;
    try {
      setLoading(true);
      const vaults = await client.fetchAllVaultTypes();
      
      const positionsWithVault = await Promise.all(
        vaults.map(async (vault) => {
          try {
            const position = await client.fetchPosition(vault.publicKey);
            if (position && (position.collateralAmount > 0 || position.debtAmount > 0)) {
              return { vault, position };
            }
          } catch (e) {
            return null;
          }
          return null;
        })
      );

      setPositions(positionsWithVault.filter(p => p !== null));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-white mb-2">Wallet Not Connected</h2>
          <p className="text-gray-400">Please connect your wallet to view your dashboard</p>
        </div>
      </div>
    );
  }

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
              <Link href="/vaults" className="text-gray-300 hover:text-white transition-colors">
                Vaults
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">My Dashboard</h1>
          <p className="text-xl text-gray-400">Manage all your positions in one place</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading your positions...</p>
          </div>
        ) : positions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📊</div>
            <h2 className="text-3xl font-bold text-white mb-4">No Active Positions</h2>
            <p className="text-xl text-gray-400 mb-8">Start by opening a vault and depositing collateral</p>
            <Link 
              href="/vaults"
              className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white shadow-lg shadow-cyan-500/50"
            >
              Browse Vaults
            </Link>
          </div>
        ) : (
          <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20">
                <p className="text-sm text-cyan-400 mb-2">Total Collateral</p>
                <p className="text-3xl font-bold text-white">
                  ${positions.reduce((sum, p) => sum + (p.position.collateralAmount / 1_000_000), 0).toFixed(2)}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                <p className="text-sm text-blue-400 mb-2">Total Borrowed</p>
                <p className="text-3xl font-bold text-white">
                  ${positions.reduce((sum, p) => sum + (p.position.debtAmount / 1_000_000), 0).toFixed(2)} AUSD
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                <p className="text-sm text-green-400 mb-2">Active Positions</p>
                <p className="text-3xl font-bold text-white">{positions.length}</p>
              </div>
            </div>

            {/* Positions List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">Your Positions</h2>
              {positions.map(({ vault, position }) => {
                const collateral = (position.collateralAmount / 1_000_000).toFixed(6);
                const debt = (position.debtAmount / 1_000_000).toFixed(6);
                const healthFactor = position.collateralAmount > 0 
                  ? ((position.collateralAmount / Math.max(position.debtAmount, 1)) * 100).toFixed(0)
                  : "∞";

                return (
                  <div
                    key={vault.publicKey.toString()}
                    className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 backdrop-blur-xl hover:border-cyan-500/50 transition-all cursor-pointer"
                    onClick={() => router.push(`/vault/${vault.publicKey.toString()}`)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Collateral Vault</h3>
                        <p className="text-sm text-gray-500 font-mono">
                          {vault.account.collateralMint.toString().slice(0, 16)}...
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        parseInt(healthFactor) >= 150 
                          ? "bg-green-500/20 text-green-400"
                          : parseInt(healthFactor) >= 120
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        Health: {healthFactor}%
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Collateral</p>
                        <p className="text-xl font-semibold text-white">{collateral}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Debt (AUSD)</p>
                        <p className="text-xl font-semibold text-cyan-400">{debt}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">LTV Ratio</p>
                        <p className="text-xl font-semibold text-white">
                          {((vault.account.ltvBps / 100)).toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold text-white transition-all">
                        Manage →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
