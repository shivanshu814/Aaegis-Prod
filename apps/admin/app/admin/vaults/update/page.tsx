"use client";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAegis } from "../../../providers/aegis-sdk";

function UpdateVaultContent() {
  const { client } = useAegis();
  const wallet = useAnchorWallet();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mintParam = searchParams.get("mint");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    oraclePubkey: "",
    ltvBps: "",
    liqThresholdBps: "",
    liqPenaltyBps: "",
    stabilityFeeBps: "",
    mintFeeBps: "",
    redeemFeeBps: "",
    vaultDebtCeiling: "",
  });

  useEffect(() => {
    if (mintParam && client) {
      fetchVaultData();
    }
  }, [mintParam, client]);

  const fetchVaultData = async () => {
    if (!client || !mintParam) return;
    try {
      const mint = new PublicKey(mintParam);
      const [vaultPda] = client.getVaultTypePDA(mint);
      const vaultAccount = await client.program.account.vaultType.fetch(vaultPda);
      
      setFormData({
        oraclePubkey: vaultAccount.oraclePriceAccount.toString(),
        ltvBps: vaultAccount.ltvBps.toString(),
        liqThresholdBps: vaultAccount.liqThresholdBps.toString(),
        liqPenaltyBps: vaultAccount.liqPenaltyBps.toString(),
        stabilityFeeBps: vaultAccount.stabilityFeeBps.toString(),
        mintFeeBps: vaultAccount.mintFeeBps.toString(),
        redeemFeeBps: vaultAccount.redeemFeeBps.toString(),
        vaultDebtCeiling: vaultAccount.vaultDebtCeiling.toString(),
      });
    } catch (e) {
      console.error("Error fetching vault:", e);
      alert("Error fetching vault data");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!client || !wallet || !mintParam) return;
    setLoading(true);
    try {
      const collateralMint = new PublicKey(mintParam);
      const oraclePubkey = new PublicKey(formData.oraclePubkey);
      
      const tx = await client.updateVaultType(collateralMint, {
        oraclePubkey,
        ltvBps: Number(formData.ltvBps),
        liqThresholdBps: Number(formData.liqThresholdBps),
        liqPenaltyBps: Number(formData.liqPenaltyBps),
        stabilityFeeBps: Number(formData.stabilityFeeBps),
        mintFeeBps: Number(formData.mintFeeBps),
        redeemFeeBps: Number(formData.redeemFeeBps),
        vaultDebtCeiling: Number(formData.vaultDebtCeiling),
      });
      
      console.log("Vault Updated:", tx);
      alert("Vault Type Updated Successfully!");
      router.push("/admin/vaults");
    } catch (e) {
      console.error(e);
      alert("Error updating vault type");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-white">Loading vault data...</div>;

  return (
    <div className="p-8 text-white max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        Update Vault Configuration
      </h1>
      
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <span className="text-gray-400 text-sm block mb-1">Collateral Mint</span>
          <span className="font-mono text-blue-300">{mintParam}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-300">Oracle Pubkey</label>
            <input 
              name="oraclePubkey"
              type="text" 
              value={formData.oraclePubkey} 
              onChange={handleChange}
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

        <div className="flex gap-4 mt-8">
          <button 
            onClick={() => router.back()}
            className="w-full py-3 px-4 rounded-xl font-semibold bg-white/5 hover:bg-white/10 transition-all border border-white/10"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpdate}
            disabled={loading || !wallet}
            className="w-full py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20"
          >
            {loading ? "Updating..." : "Update Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UpdateVaultPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading...</div>}>
      <UpdateVaultContent />
    </Suspense>
  );
}
