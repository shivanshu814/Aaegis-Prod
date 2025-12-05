"use client";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAegis } from "../../providers/aegis-sdk";

export default function VaultDetailPage() {
  const { vaultId } = useParams();
  const { client } = useAegis();
  const wallet = useAnchorWallet();
  const [vault, setVault] = useState<any>(null);
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"deposit" | "mint" | "repay" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (vaultId && client) {
      fetchVaultAndPosition();
    }
  }, [vaultId, client, wallet]);

  const fetchVaultAndPosition = async () => {
    if (!client || !vaultId) return;
    try {
      const vaultPubkey = new PublicKey(vaultId as string);
      const vaultData = await client.program.account.vaultType.fetch(vaultPubkey);
      setVault({ publicKey: vaultPubkey, account: vaultData });

      if (wallet) {
        const pos = await client.fetchPosition(vaultPubkey);
        setPosition(pos);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenPosition = async () => {
    if (!client || !vaultId || !wallet) return;
    setLoading(true);
    try {
      const tx = await client.openPosition(new PublicKey(vaultId as string));
      alert(`Position opened! TX: ${tx}`);
      await fetchVaultAndPosition();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!client || !amount || !vault || !wallet) return;
    setLoading(true);
    try {
      const tx = await client.depositCollateral(
        vault.publicKey,
        parseFloat(amount) * 1_000_000,
        vault.account.collateralMint
      );
      alert(`Deposited! TX: ${tx}`);
      await fetchVaultAndPosition();
      setAmount("");
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    if (!client || !amount || !vault || !wallet) return;
    setLoading(true);
    try {
      const tx = await client.mintStablecoin(
        vault.publicKey,
        parseFloat(amount) * 1_000_000
      );
      alert(`Minted ${amount} AUSD! TX: ${tx}`);
      await fetchVaultAndPosition();
      setAmount("");
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRepay = async () => {
    if (!client || !amount || !vault || !wallet) return;
    setLoading(true);
    try {
      const tx = await client.repayStablecoin(
        vault.publicKey,
        parseFloat(amount) * 1_000_000
      );
      alert(`Repaid ${amount} AUSD! TX: ${tx}`);
      await fetchVaultAndPosition();
      setAmount("");
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!client || !amount || !vault || !wallet) return;
    setLoading(true);
    try {
      const tx = await client.withdrawCollateral(
        vault.publicKey,
        parseFloat(amount) * 1_000_000,
        vault.account.collateralMint
      );
      alert(`Withdrew ${amount} collateral! TX: ${tx}`);
      await fetchVaultAndPosition();
      setAmount("");
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!vault) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading vault...</p>
        </div>
      </div>
    );
  }

  const collateral = position ? (position.collateralAmount / 1_000_000).toFixed(6) : "0";
  const debt = position ? (position.debtAmount / 1_000_000).toFixed(6) : "0";
  const maxBorrow = position && vault
    ? ((position.collateralAmount / 1_000_000) * (vault.account.ltvBps / 10000)).toFixed(2)
    : "0";
  const available = parseFloat(maxBorrow) - parseFloat(debt);

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
              <Link href="/vaults" className="text-gray-300 hover:text-white transition-colors">
                ← Back to Vaults
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

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Vault Details</h1>
          <p className="text-gray-400 font-mono text-sm">{vaultId}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Position Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Position Overview */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-white mb-6">Your Position</h2>
              
              {!wallet ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">Connect your wallet to view positions</p>
                </div>
              ) : !position ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">You don't have a position yet</p>
                  <button
                    onClick={handleOpenPosition}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white shadow-lg disabled:opacity-50"
                  >
                    {loading ? "Opening..." : "Open Position"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-black/20">
                    <p className="text-sm text-gray-400 mb-1">Collateral Deposited</p>
                    <p className="text-3xl font-bold text-white">{collateral}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20">
                    <p className="text-sm text-gray-400 mb-1">AUSD Borrowed</p>
                    <p className="text-3xl font-bold text-cyan-400">{debt}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20">
                    <p className="text-sm text-gray-400 mb-1">Max Borrow</p>
                    <p className="text-2xl font-bold text-white">${maxBorrow}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20">
                    <p className="text-sm text-gray-400 mb-1">Available to Borrow</p>
                    <p className="text-2xl font-bold text-green-400">${available.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Tabs */}
            {position && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 backdrop-blur-xl">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 p-1 rounded-xl bg-black/20">
                  {["deposit", "mint", "repay", "withdraw"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold capitalize transition-all ${
                        activeTab === tab
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="space-y-4">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-6 py-4 text-2xl rounded-xl bg-black/20 border border-white/10 focus:border-cyan-500 outline-none text-white placeholder-gray-500"
                  />

                  <button
                    onClick={
                      activeTab === "deposit" ? handleDeposit :
                      activeTab === "mint" ? handleMint :
                      activeTab === "repay" ? handleRepay :
                      handleWithdraw
                    }
                    disabled={loading || !amount}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing..." : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Vault Info */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 backdrop-blur-xl">
              <h3 className="text-xl font-bold text-white mb-4">Vault Parameters</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Max LTV</span>
                  <span className="font-semibold text-white">{(vault.account.ltvBps / 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Liq. Threshold</span>
                  <span className="font-semibold text-yellow-400">{(vault.account.liqThresholdBps / 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Liq. Penalty</span>
                  <span className="font-semibold text-red-400">{(vault.account.liqPenaltyBps / 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stability Fee</span>
                  <span className="font-semibold text-purple-400">{(vault.account.stabilityFeeBps / 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mint Fee</span>
                  <span className="font-semibold text-gray-300">{(vault.account.mintFeeBps / 100).toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <h4 className="font-semibold text-cyan-400 mb-2">💡 Tip</h4>
              <p className="text-sm text-gray-300">
                Keep your collateral ratio above {(vault.account.liqThresholdBps / 100).toFixed(0)}% to avoid liquidation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
