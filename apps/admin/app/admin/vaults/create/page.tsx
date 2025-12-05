"use client";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAegis } from "../../../providers/aegis-sdk";

export default function CreateVaultPage() {
  const { client } = useAegis();
  const wallet = useAnchorWallet();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    collateralMint: "",
    oraclePubkey: "J83w4HKfqxwcq3BEMMkPFSppX3gqekLymdjwujLbZdpmC", // SOL/USD Pyth Devnet
    ltvBps: "5000", // 50%
    liqThresholdBps: "7500", // 75%
    liqPenaltyBps: "500", // 5%
    stabilityFeeBps: "100", // 1%
    mintFeeBps: "10", // 0.1%
    redeemFeeBps: "10", // 0.1%
    vaultDebtCeiling: "1000000000",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    if (!client || !wallet) return;
    
    // Validate inputs
    if (!formData.collateralMint.trim()) {
      alert("Please enter a Collateral Mint address");
      return;
    }
    
    if (!formData.oraclePubkey.trim()) {
      alert("Please enter an Oracle Pubkey");
      return;
    }
    
    setLoading(true);
    try {
      let collateralMint: PublicKey;
      let oraclePubkey: PublicKey;
      
      // Validate Collateral Mint
      try {
        collateralMint = new PublicKey(formData.collateralMint);
      } catch (e) {
        alert("Invalid Collateral Mint address. Please check the address.");
        setLoading(false);
        return;
      }
      
      // Validate Oracle Pubkey
      try {
        oraclePubkey = new PublicKey(formData.oraclePubkey);
      } catch (e) {
        alert("Invalid Oracle Pubkey. Please check the address.");
        setLoading(false);
        return;
      }
      
      const tx = await client.createVaultType(collateralMint, {
        oraclePubkey,
        ltvBps: Number(formData.ltvBps),
        liqThresholdBps: Number(formData.liqThresholdBps),
        liqPenaltyBps: Number(formData.liqPenaltyBps),
        stabilityFeeBps: Number(formData.stabilityFeeBps),
        mintFeeBps: Number(formData.mintFeeBps),
        redeemFeeBps: Number(formData.redeemFeeBps),
        vaultDebtCeiling: Number(formData.vaultDebtCeiling),
      });
      
      console.log("Vault Created:", tx);
      alert("Vault Type Created Successfully!");
      router.push("/admin/vaults");
    } catch (e) {
      console.error(e);
      alert(`Error creating vault type: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 text-white max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        Create New Vault Type
      </h1>
      
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-300">Collateral Mint (Token Address)</label>
            <input 
              name="collateralMint"
              type="text" 
              value={formData.collateralMint} 
              onChange={handleChange}
              placeholder="e.g. EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v (USDC)"
              className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all font-mono text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-300">Oracle Pubkey</label>
            <input 
              name="oraclePubkey"
              type="text" 
              value={formData.oraclePubkey} 
              onChange={handleChange}
              placeholder="Oracle Account Address"
              className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">LTV (bps)</label>
            <input 
              name="ltvBps"
              type="number" 
              value={formData.ltvBps} 
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">5000 = 50%</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Liquidation Threshold (bps)</label>
            <input 
              name="liqThresholdBps"
              type="number" 
              value={formData.liqThresholdBps} 
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">7500 = 75%</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Liquidation Penalty (bps)</label>
            <input 
              name="liqPenaltyBps"
              type="number" 
              value={formData.liqPenaltyBps} 
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Stability Fee (bps)</label>
            <input 
              name="stabilityFeeBps"
              type="number" 
              value={formData.stabilityFeeBps} 
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Mint Fee (bps)</label>
            <input 
              name="mintFeeBps"
              type="number" 
              value={formData.mintFeeBps} 
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Redeem Fee (bps)</label>
            <input 
              name="redeemFeeBps"
              type="number" 
              value={formData.redeemFeeBps} 
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all font-mono text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-300">Vault Debt Ceiling</label>
            <input 
              name="vaultDebtCeiling"
              type="number" 
              value={formData.vaultDebtCeiling} 
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all font-mono text-sm"
            />
          </div>
        </div>

        <button 
          onClick={handleCreate}
          disabled={loading || !wallet}
          className="w-full mt-8 py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/20"
        >
          {loading ? "Creating Vault..." : "Create Vault Type"}
        </button>
      </div>
    </div>
  );
}
