"use client";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAegis } from "../../providers/aegis-sdk";


export default function ProtocolPage() {
  const { client } = useAegis();
  const wallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);
  const [protocolState, setProtocolState] = useState<any | null>(null);

  useEffect(() => {
    fetchState();
  }, [client]);

  const fetchState = async () => {
    if (!client) return;
    try {
      const state = await client.fetchProtocolState();
      setProtocolState(state);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch protocol state");
    }
  };

  const handleUpdateFlag = async (flag: string, value: boolean) => {
    if (!client || !wallet) return;
    setLoading(true);
    const toastId = toast.loading(`Updating ${flag}...`);
    try {
      const params: any = {};
      params[flag] = value;

      await client.updateFeatureFlags(params);
      await fetchState();
      toast.success(`Successfully updated ${flag}!`, { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error("Failed to update feature flag", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!protocolState) return <div className="p-8 text-white">Loading protocol state...</div>;

  return (
    <>
      <Toaster position="top-right" />
      <div className="p-8 text-white max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Global Protocol Controls
        </h1>

        <div className="grid gap-6">
          {/* Emergency Shutdown */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-red-400">Emergency Shutdown</h3>
                <p className="text-sm text-red-300/70 mt-1">
                  Permanently disable the protocol. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => handleUpdateFlag("isShutdown", !protocolState.isShutdown)}
                disabled={loading || !wallet}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${protocolState.isShutdown
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20"
                  }`}
              >
                {protocolState.isShutdown ? "SHUTDOWN ACTIVE" : "TRIGGER SHUTDOWN"}
              </button>
            </div>
          </div>

          {/* Protocol Pause */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Protocol Pause</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Temporarily pause all protocol interactions.
                </p>
              </div>
              <button
                onClick={() => handleUpdateFlag("isProtocolPaused", !protocolState.isProtocolPaused)}
                disabled={loading || !wallet}
                className={`px-6 py-3 rounded-xl font-bold transition-all w-40 ${protocolState.isProtocolPaused
                  ? "bg-green-600 hover:bg-green-500 text-white"
                  : "bg-yellow-600 hover:bg-yellow-500 text-white"
                  }`}
              >
                {protocolState.isProtocolPaused ? "UNPAUSE" : "PAUSE"}
              </button>
            </div>
          </div>

          {/* Minting Pause */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Minting Control</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Pause or resume stablecoin minting.
                </p>
              </div>
              <button
                onClick={() => handleUpdateFlag("isMintPaused", !protocolState.isMintPaused)}
                disabled={loading || !wallet}
                className={`px-6 py-3 rounded-xl font-bold transition-all w-40 ${protocolState.isMintPaused
                  ? "bg-green-600 hover:bg-green-500 text-white"
                  : "bg-yellow-600 hover:bg-yellow-500 text-white"
                  }`}
              >
                {protocolState.isMintPaused ? "RESUME" : "PAUSE"}
              </button>
            </div>
          </div>

          {/* Redemption Pause */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Redemption Control</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Pause or resume stablecoin redemption.
                </p>
              </div>
              <button
                onClick={() => handleUpdateFlag("isRedeemPaused", !protocolState.isRedeemPaused)}
                disabled={loading || !wallet}
                className={`px-6 py-3 rounded-xl font-bold transition-all w-40 ${protocolState.isRedeemPaused
                  ? "bg-green-600 hover:bg-green-500 text-white"
                  : "bg-yellow-600 hover:bg-yellow-500 text-white"
                  }`}
              >
                {protocolState.isRedeemPaused ? "RESUME" : "PAUSE"}
              </button>
            </div>
          </div>
          {/* Global Parameters */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6">Global Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ConfigInput
                label="Mint Fee (bps)"
                value={protocolState?.baseMintFeeBps?.toString() || "0"}
                onUpdate={async (val) => {
                  if (!client) throw new Error("Client not ready");
                  return client.setMintFeeBps(Number(val));
                }}
              />
              <ConfigInput
                label="Redeem Fee (bps)"
                value={protocolState?.baseRedeemFeeBps?.toString() || "0"}
                onUpdate={async (val) => {
                  if (!client) throw new Error("Client not ready");
                  return client.setRedeemFeeBps(Number(val));
                }}
              />
              <ConfigInput
                label="Stability Fee (bps)"
                value={protocolState?.baseStabilityFeeBps?.toString() || "0"}
                onUpdate={async (val) => {
                  if (!client) throw new Error("Client not ready");
                  return client.setStabilityFeeBps(Number(val));
                }}
              />
              <ConfigInput
                label="Collateral Ratio (bps)"
                value={protocolState?.baseCollateralRatioBps?.toString() || "0"}
                onUpdate={async (val) => {
                  if (!client) throw new Error("Client not ready");
                  return client.setCollateralRatioBps(Number(val));
                }}
              />
              <ConfigInput
                label="Liquidation Penalty (bps)"
                value={protocolState?.baseLiquidationPenaltyBps?.toString() || "0"}
                onUpdate={async (val) => {
                  if (!client) throw new Error("Client not ready");
                  return client.setLiquidationPenaltyBps(Number(val));
                }}
              />
              <ConfigInput
                label="Liquidation Threshold (bps)"
                value={protocolState?.baseLiquidationThresholdBps?.toString() || "0"}
                onUpdate={async (val) => {
                  if (!client) throw new Error("Client not ready");
                  return client.setLiquidationThresholdBps(Number(val));
                }}
              />
              <ConfigInput
                label="Global Debt Ceiling"
                value={protocolState?.globalDebtCeiling?.toString() || "0"}
                onUpdate={async (val) => {
                  if (!client) throw new Error("Client not ready");
                  return client.setGlobalDebtCeiling(Number(val));
                }}
              />
              <ConfigInput
                label="Default Vault Debt Ceiling"
                value={protocolState?.defaultVaultDebtCeiling?.toString() || "0"}
                onUpdate={async (val) => {
                  if (!client) throw new Error("Client not ready");
                  return client.setDefaultVaultDebtCeiling(Number(val));
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ConfigInput({ label, value, onUpdate }: { label: string, value: string, onUpdate: (val: string) => Promise<any> }) {
  const [val, setVal] = useState(value);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await onUpdate(val);
      alert(`${label} updated successfully`);
    } catch (e) {
      console.error(e);
      alert(`Error updating ${label}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-400">{label}</label>
      <div className="flex gap-2">
        <input
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 outline-none transition-all font-mono text-sm"
        />
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/30 transition-all disabled:opacity-50"
        >
          {loading ? "..." : "Set"}
        </button>
      </div>
    </div>
  );
}
