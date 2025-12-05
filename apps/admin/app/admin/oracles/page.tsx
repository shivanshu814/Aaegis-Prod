"use client";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAegis } from "../../providers/aegis-sdk";

export default function OraclesPage() {
  const { client } = useAegis();
  const wallet = useAnchorWallet();
  const [protocolState, setProtocolState] = useState<any | null>(null);
  const [vaults, setVaults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [ttlInput, setTtlInput] = useState("");
  const [authorityInput, setAuthorityInput] = useState("");

  useEffect(() => {
    fetchData();
  }, [client]);

  const fetchData = async () => {
    if (!client) return;
    try {
      const state = await client.fetchProtocolState();
      setProtocolState(state);
      setTtlInput(state.oracleTtlSeconds.toString());
      setAuthorityInput(state.oracleUpdateAuthority.toString());

      const allVaults = await client.fetchAllVaultTypes();
      setVaults(allVaults);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch oracle data");
    }
  };

  const handleUpdateTtl = async () => {
    if (!client || !wallet) return;
    setLoading(true);
    const toastId = toast.loading("Updating Oracle TTL...");
    try {
      await client.setOracleTtlSeconds(Number(ttlInput));
      toast.success("Oracle TTL updated successfully", { id: toastId });
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("Error updating Oracle TTL", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAuthority = async () => {
    if (!client || !wallet) return;
    setLoading(true);
    const toastId = toast.loading("Updating Oracle Authority...");
    try {
      const newAuth = new PublicKey(authorityInput);
      await client.updateOracleAuthority(newAuth);
      toast.success("Oracle Authority updated successfully", { id: toastId });
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("Error updating Oracle Authority", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOracle = async (collateralMint: PublicKey, newOracle: string) => {
    if (!client || !wallet) return;
    const toastId = toast.loading("Updating Oracle...");
    try {
      const oraclePubkey = new PublicKey(newOracle);
      // Note: The SDK maps 'oraclePubkey' to 'oraclePriceAccount' internally
      await client.updateVaultType(collateralMint, { oraclePubkey });
      toast.success("Oracle updated successfully", { id: toastId });
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("Error updating oracle", { id: toastId });
    }
  };

  if (!protocolState) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 text-white max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 gradient-text">
        Oracle Management
      </h1>

      <div className="grid gap-8">
        {/* Global Oracle Settings */}
        <div className="glass border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Global Oracle Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-400">Oracle TTL (Seconds)</label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={ttlInput}
                  onChange={(e) => setTtlInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 outline-none transition-all font-mono text-sm"
                />
                <button
                  onClick={handleUpdateTtl}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/30 transition-all disabled:opacity-50"
                >
                  {loading ? "..." : "Update"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-400">Oracle Update Authority</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={authorityInput}
                  onChange={(e) => setAuthorityInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 outline-none transition-all font-mono text-sm"
                />
                <button
                  onClick={handleUpdateAuthority}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/30 transition-all disabled:opacity-50"
                >
                  {loading ? "..." : "Change"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Per-Vault Oracle Settings */}
        <div className="glass border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Vault Oracles</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="p-4">Vault Type</th>
                  <th className="p-4">Collateral Mint</th>
                  <th className="p-4">Current Oracle</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {vaults.map((vault) => (
                  <tr key={vault.publicKey.toString()} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="p-4 font-mono">#{vault.account.vaultTypeId}</td>
                    <td className="p-4 font-mono text-gray-300">{vault.account.collateralMint.toString().slice(0, 8)}...</td>
                    <td className="p-4 font-mono text-blue-300">{vault.account.oraclePriceAccount.toString()}</td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          const newOracle = prompt("Enter new oracle public key:", vault.account.oraclePriceAccount.toString());
                          if (newOracle && newOracle !== vault.account.oraclePriceAccount.toString()) {
                            handleUpdateOracle(vault.account.collateralMint, newOracle);
                          }
                        }}
                        className="text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        Update Oracle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {vaults.length === 0 && (
              <div className="text-center py-8 text-gray-500">No vaults found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
