"use client";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAegis } from "../../providers/aegis-sdk";

export default function VaultsPage() {
  const { client } = useAegis();
  const router = useRouter();
  const wallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);
  const [vaults, setVaults] = useState<any[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchVaults();
  }, [client]);

  const fetchVaults = async () => {
    if (!client) return;
    setLoading(true);
    try {
      const vaults = await client.fetchAllVaultTypes();
      setVaults(vaults);
      fetchPrices(vaults);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrices = async (vaults: any[]) => {
    if (!client) return;
    const newPrices: Record<string, number> = {};
    
    for (const vault of vaults) {
      try {
        const price = await client.getOraclePrice(vault.account.oraclePriceAccount);
        if (price !== null) {
          newPrices[vault.publicKey.toString()] = price;
        }
      } catch (e) {
        console.error("Error fetching price for vault", vault.publicKey.toString(), e);
      }
    }
    setPrices(newPrices);
  };

  const handleToggleActive = async (collateralMint: PublicKey) => {
    if (!client || !wallet) return;
    try {
      await client.toggleVaultActive(collateralMint);
      await fetchVaults();
    } catch (e) {
      console.error(e);
      alert("Error toggling vault status");
    }
  };

  return (
    <div className="p-8 text-white max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Manage Vault Types
        </h1>
        <Link 
          href="/admin/vaults/create"
          className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition-all"
        >
          + Create New Vault
        </Link>
      </div>
      
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading vaults...</div>
      ) : vaults.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 text-gray-400">
          No vault types found. Create one to get started.
        </div>
      ) : (
        <div className="grid gap-6">
          {vaults.map((vault) => (
            <div key={vault.publicKey.toString()} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Vault Type #{vault.account.vaultTypeId}
                  </h3>
                  <p className="text-sm text-gray-400 font-mono">
                    Collateral: {vault.account.collateralMint.toString()}
                  </p>
                  <p className="text-xs text-blue-400 font-mono mt-1">
                    Oracle: {vault.account.oraclePriceAccount.toString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    vault.account.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}>
                    {vault.account.isActive ? "ACTIVE" : "INACTIVE"}
                  </div>
                  {prices[vault.publicKey.toString()] !== undefined && (
                    <div className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400">
                      Price: ${prices[vault.publicKey.toString()]!.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                <div>
                  <span className="block text-gray-500 text-xs mb-1">LTV</span>
                  <span className="font-mono text-white">{(vault.account.ltvBps.toNumber() / 100).toFixed(2)}%</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs mb-1">Liq. Threshold</span>
                  <span className="font-mono text-white">{(vault.account.liqThresholdBps.toNumber() / 100).toFixed(2)}%</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs mb-1">Stability Fee</span>
                  <span className="font-mono text-white">{(vault.account.stabilityFeeBps / 100).toFixed(2)}%</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs mb-1">Debt Ceiling</span>
                  <span className="font-mono text-white">{vault.account.vaultDebtCeiling.toString()}</span>
                </div>
              </div>

              <div className="flex gap-3 border-t border-white/5 pt-4">
                <button 
                  onClick={() => handleToggleActive(vault.account.collateralMint)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    vault.account.isActive 
                      ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" 
                      : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                  }`}
                >
                  {vault.account.isActive ? "Pause / Disable" : "Resume / Enable"}
                </button>
                
                {/* Update button could open a modal or navigate to an edit page. For now, placeholder. */}
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                    onClick={() => router.push(`/admin/vaults/update?mint=${vault.account.collateralMint.toString()}`)}
                  >
                    Update Configuration
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
