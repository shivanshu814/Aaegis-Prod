"use client";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useAegis } from "../../providers/aegis-sdk";

export default function PositionsPage() {
  const { client } = useAegis();
  const wallet = useAnchorWallet();
  const [vaultTypes, setVaultTypes] = useState<any[]>([]);
  const [selectedVault, setSelectedVault] = useState<string>("");
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchVaultTypes();
  }, [client]);

  useEffect(() => {
    if (selectedVault) {
      fetchPosition();
    }
  }, [selectedVault, client]);

  const fetchVaultTypes = async () => {
    if (!client) return;
    try {
      const vaults = await client.fetchAllVaultTypes();
      setVaultTypes(vaults);
      if (vaults.length > 0 && !selectedVault) {
        setSelectedVault(vaults[0].publicKey.toString());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPosition = async () => {
    if (!client || !selectedVault) return;
    try {
      const pos = await client.fetchPosition(new PublicKey(selectedVault));
      setPosition(pos);
    } catch (e) {
      console.log("Position not found");
      setPosition(null);
    }
  };

  const handleOpenPosition = async () => {
    if (!client || !selectedVault || !wallet) return;
    setLoading(true);
    try {
      const tx = await client.openPosition(new PublicKey(selectedVault));
      alert(`Position Opened! TX: ${tx}`);
      await fetchPosition();
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!client || !selectedVault || !amount || !wallet) return;
    setLoading(true);
    try {
      const vaultData = vaultTypes.find(v => v.publicKey.toString() === selectedVault);
      if (!vaultData) throw new Error("Vault not found");

      const tx = await client.depositCollateral(
        new PublicKey(selectedVault),
        parseFloat(amount) * 1_000_000, // Convert to 6 decimals
        vaultData.account.collateralMint
      );
      alert(`Deposited! TX: ${tx}`);
      await fetchPosition();
      setAmount("");
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    if (!client || !selectedVault || !amount || !wallet) return;
    setLoading(true);
    try {
      const tx = await client.mintStablecoin(
        new PublicKey(selectedVault),
        parseFloat(amount) * 1_000_000 // Convert to 6 decimals
      );
      alert(`Minted! TX: ${tx}`);
      await fetchPosition();
      setAmount("");
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRepay = async () => {
    if (!client || !selectedVault || !amount || !wallet) return;
    setLoading(true);
    try {
      const tx = await client.repayStablecoin(
        new PublicKey(selectedVault),
        parseFloat(amount) * 1_000_000
      );
      alert(`Repaid! TX: ${tx}`);
      await fetchPosition();
      setAmount("");
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!client || !selectedVault || !amount || !wallet) return;
    setLoading(true);
    try {
      const vaultData = vaultTypes.find(v => v.publicKey.toString() === selectedVault);
      if (!vaultData) throw new Error("Vault not found");

      const tx = await client.withdrawCollateral(
        new PublicKey(selectedVault),
        parseFloat(amount) * 1_000_000,
        vaultData.account.collateralMint
      );
      alert(`Withdrew! TX: ${tx}`);
      await fetchPosition();
      setAmount("");
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) {
    return (
      <div className="p-8 text-white text-center">
        <h1 className="text-3xl font-bold mb-4">Please connect your wallet</h1>
      </div>
    );
  }

  return (
    <div className="p-8 text-white max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        My Positions
      </h1>

      {/* Vault Selector */}
      <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-6">
        <label className="block text-sm font-medium mb-2 text-gray-400">Select Vault Type</label>
        <select
          value={selectedVault}
          onChange={(e) => setSelectedVault(e.target.value)}
          className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 outline-none transition-all"
        >
          {vaultTypes.map((v) => (
            <option key={v.publicKey.toString()} value={v.publicKey.toString()}>
              {v.account.collateralMint.toString().slice(0, 8)}... (LTV: {(v.account.ltvBps / 100).toFixed(1)}%)
            </option>
          ))}
        </select>
      </div>

      {/* Position Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-400">Position Status</h3>
          {position ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Collateral</p>
                <p className="text-2xl font-bold">{(position.collateralAmount / 1_000_000).toFixed(6)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Debt</p>
                <p className="text-2xl font-bold">{(position.debtAmount / 1_000_000).toFixed(6)} AUSD</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Health Factor</p>
                <p className="text-xl font-bold text-green-400">
                  {position.collateralAmount > 0 
                    ? ((position.collateralAmount / Math.max(position.debtAmount, 1)) * 100).toFixed(2)
                    : "∞"}%
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-400 mb-4">No position found</p>
              <button
                onClick={handleOpenPosition}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {loading ? "Opening..." : "Open Position"}
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 outline-none transition-all"
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDeposit}
                disabled={loading || !position}
                className="px-4 py-3 bg-green-600/20 text-green-400 rounded-xl hover:bg-green-600/30 transition-all disabled:opacity-50 font-medium"
              >
                Deposit
              </button>
              <button
                onClick={handleMint}
                disabled={loading || !position}
                className="px-4 py-3 bg-purple-600/20 text-purple-400 rounded-xl hover:bg-purple-600/30 transition-all disabled:opacity-50 font-medium"
              >
                Mint
              </button>
              <button
                onClick={handleRepay}
                disabled={loading || !position}
                className="px-4 py-3 bg-yellow-600/20 text-yellow-400 rounded-xl hover:bg-yellow-600/30 transition-all disabled:opacity-50 font-medium"
              >
                Repay
              </button>
              <button
                onClick={handleWithdraw}
                disabled={loading || !position}
                className="px-4 py-3 bg-red-600/20 text-red-400 rounded-xl hover:bg-red-600/30 transition-all disabled:opacity-50 font-medium"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Notes</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
          <li>Open a position first before depositing collateral</li>
          <li>Amounts are in 6 decimals (e.g., 1.5 = 1.5 USD)</li>
          <li>Make sure you have collateral tokens in your wallet</li>
          <li>Keep your health factor above 100% to avoid liquidation</li>
        </ul>
      </div>
    </div>
  );
}
