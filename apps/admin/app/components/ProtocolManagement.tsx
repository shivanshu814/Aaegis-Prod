"use client";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useAegis } from "../providers/aegis-sdk";

export default function ProtocolManagement() {
  const { client } = useAegis();
  const wallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [protocolState, setProtocolState] = useState<any | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Form states for different sections
  const [riskParams, setRiskParams] = useState({
    collateralRatio: "",
    liquidationThreshold: "",
    liquidationPenalty: "",
  });

  const [feeParams, setFeeParams] = useState({
    mintFee: "",
    redeemFee: "",
    stabilityFee: "",
  });

  const [supplyLimits, setSupplyLimits] = useState({
    globalDebtCeiling: "",
    vaultDebtCeiling: "",
  });

  const [roleManagement, setRoleManagement] = useState({
    targetAccount: "",
    roleType: "0",
  });

  const [featureFlags, setFeatureFlags] = useState({
    isProtocolPaused: false,
    isMintPaused: false,
    isRedeemPaused: false,
    isShutdown: false,
  });

  // Fetch protocol state
  const fetchState = async () => {
    if (!client) return;
    try {
      const state = await client.fetchProtocolState();
      setProtocolState(state);
      
      // Update feature flags from state
      setFeatureFlags({
        isProtocolPaused: state.isProtocolPaused,
        isMintPaused: state.isMintPaused,
        isRedeemPaused: state.isRedeemPaused,
        isShutdown: state.isShutdown,
      });
    } catch (err) {
      console.error("Error fetching protocol state:", err);
    }
  };

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (autoRefresh && client) {
      fetchState();
      const interval = setInterval(fetchState, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, client]);

  const handleTransaction = async (txPromise: Promise<string>, successMsg: string) => {
    try {
      setLoading(true);
      setTxSignature(null);
      const sig = await txPromise;
      setTxSignature(sig);
      console.log(successMsg, sig);
      
      // Wait a bit then refresh state
      setTimeout(() => fetchState(), 2000);
    } catch (err) {
      console.error("Transaction error:", err);
      alert(`Transaction failed. See console for details.`);
    } finally {
      setLoading(false);
    }
  };

  // Risk Parameter Handlers
  const handleSetCollateralRatio = () => {
    if (!client || !riskParams.collateralRatio) return;
    const bps = Math.floor(parseFloat(riskParams.collateralRatio) * 100);
    handleTransaction(
      client.setCollateralRatioBps(bps),
      "Collateral ratio updated:"
    );
  };

  const handleSetLiquidationThreshold = () => {
    if (!client || !riskParams.liquidationThreshold) return;
    const bps = Math.floor(parseFloat(riskParams.liquidationThreshold) * 100);
    handleTransaction(
      client.setLiquidationThresholdBps(bps),
      "Liquidation threshold updated:"
    );
  };

  const handleSetLiquidationPenalty = () => {
    if (!client || !riskParams.liquidationPenalty) return;
    const bps = Math.floor(parseFloat(riskParams.liquidationPenalty) * 100);
    handleTransaction(
      client.setLiquidationPenaltyBps(bps),
      "Liquidation penalty updated:"
    );
  };

  // Fee Parameter Handlers
  const handleSetMintFee = () => {
    if (!client || !feeParams.mintFee) return;
    const bps = Math.floor(parseFloat(feeParams.mintFee) * 100);
    handleTransaction(client.setMintFeeBps(bps), "Mint fee updated:");
  };

  const handleSetRedeemFee = () => {
    if (!client || !feeParams.redeemFee) return;
    const bps = Math.floor(parseFloat(feeParams.redeemFee) * 100);
    handleTransaction(client.setRedeemFeeBps(bps), "Redeem fee updated:");
  };

  const handleSetStabilityFee = () => {
    if (!client || !feeParams.stabilityFee) return;
    const bps = Math.floor(parseFloat(feeParams.stabilityFee) * 100);
    handleTransaction(client.setStabilityFeeBps(bps), "Stability fee updated:");
  };

  // Supply Limit Handlers
  const handleSetGlobalDebtCeiling = () => {
    if (!client || !supplyLimits.globalDebtCeiling) return;
    handleTransaction(
      client.setGlobalDebtCeiling(parseInt(supplyLimits.globalDebtCeiling)),
      "Global debt ceiling updated:"
    );
  };

  const handleSetVaultDebtCeiling = () => {
    if (!client || !supplyLimits.vaultDebtCeiling) return;
    handleTransaction(
      client.setDefaultVaultDebtCeiling(parseInt(supplyLimits.vaultDebtCeiling)),
      "Vault debt ceiling updated:"
    );
  };

  // Role Management Handlers
  const handleAddRole = () => {
    if (!client || !roleManagement.targetAccount) return;
    try {
      const targetPubkey = new PublicKey(roleManagement.targetAccount);
      handleTransaction(
        client.addRole(targetPubkey, parseInt(roleManagement.roleType)),
        "Role added:"
      );
    } catch (e) {
      alert("Invalid public key");
    }
  };

  const handleRemoveRole = () => {
    if (!client) return;
    handleTransaction(
      client.removeRole(parseInt(roleManagement.roleType)),
      "Role removed:"
    );
  };

  // Feature Flags Handler
  const handleUpdateFeatureFlags = () => {
    if (!client) return;
    handleTransaction(
      client.updateFeatureFlags(featureFlags),
      "Feature flags updated:"
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Auto-Refresh Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Protocol Management
        </h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
            />
            Auto-refresh (5s)
          </label>
          <button
            onClick={fetchState}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 transition-all"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* Transaction Status */}
      {txSignature && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm break-all">
          <span className="font-semibold block mb-1">Transaction Success!</span>
          <a
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=custom&customUrl=http://localhost:8899`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {txSignature}
          </a>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Risk Parameters */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Risk Parameters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Collateral Ratio (%)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={riskParams.collateralRatio}
                    onChange={(e) => setRiskParams({ ...riskParams, collateralRatio: e.target.value })}
                    placeholder="150"
                    className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm"
                  />
                  <button
                    onClick={handleSetCollateralRatio}
                    disabled={loading || !wallet}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 text-sm font-medium transition-all"
                  >
                    Set
                  </button>
                </div>
                {protocolState && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {(protocolState.baseCollateralRatioBps.toNumber() / 100).toFixed(2)}%
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Liquidation Threshold (%)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={riskParams.liquidationThreshold}
                    onChange={(e) => setRiskParams({ ...riskParams, liquidationThreshold: e.target.value })}
                    placeholder="130"
                    className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm"
                  />
                  <button
                    onClick={handleSetLiquidationThreshold}
                    disabled={loading || !wallet}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 text-sm font-medium transition-all"
                  >
                    Set
                  </button>
                </div>
                {protocolState && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {(protocolState.baseLiquidationThresholdBps.toNumber() / 100).toFixed(2)}%
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Liquidation Penalty (%)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={riskParams.liquidationPenalty}
                    onChange={(e) => setRiskParams({ ...riskParams, liquidationPenalty: e.target.value })}
                    placeholder="10"
                    className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm"
                  />
                  <button
                    onClick={handleSetLiquidationPenalty}
                    disabled={loading || !wallet}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 text-sm font-medium transition-all"
                  >
                    Set
                  </button>
                </div>
                {protocolState && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {(protocolState.baseLiquidationPenaltyBps.toNumber() / 100).toFixed(2)}%
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fee Parameters */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-green-300 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Fee Parameters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Mint Fee (%)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={feeParams.mintFee}
                    onChange={(e) => setFeeParams({ ...feeParams, mintFee: e.target.value })}
                    placeholder="0.5"
                    className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all text-sm"
                  />
                  <button
                    onClick={handleSetMintFee}
                    disabled={loading || !wallet}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-sm font-medium transition-all"
                  >
                    Set
                  </button>
                </div>
                {protocolState && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {(protocolState.baseMintFeeBps / 100).toFixed(2)}%
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Redeem Fee (%)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={feeParams.redeemFee}
                    onChange={(e) => setFeeParams({ ...feeParams, redeemFee: e.target.value })}
                    placeholder="0.5"
                    className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all text-sm"
                  />
                  <button
                    onClick={handleSetRedeemFee}
                    disabled={loading || !wallet}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-sm font-medium transition-all"
                  >
                    Set
                  </button>
                </div>
                {protocolState && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {(protocolState.baseRedeemFeeBps / 100).toFixed(2)}%
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Stability Fee (%)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={feeParams.stabilityFee}
                    onChange={(e) => setFeeParams({ ...feeParams, stabilityFee: e.target.value })}
                    placeholder="2.0"
                    className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all text-sm"
                  />
                  <button
                    onClick={handleSetStabilityFee}
                    disabled={loading || !wallet}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-sm font-medium transition-all"
                  >
                    Set
                  </button>
                </div>
                {protocolState && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {(protocolState.baseStabilityFeeBps / 100).toFixed(2)}%
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Supply Limits */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Supply Limits
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Global Debt Ceiling</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={supplyLimits.globalDebtCeiling}
                    onChange={(e) => setSupplyLimits({ ...supplyLimits, globalDebtCeiling: e.target.value })}
                    placeholder="1000000000000"
                    className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-mono"
                  />
                  <button
                    onClick={handleSetGlobalDebtCeiling}
                    disabled={loading || !wallet}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-sm font-medium transition-all"
                  >
                    Set
                  </button>
                </div>
                {protocolState && (
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    Current: {protocolState.globalDebtCeiling.toString()}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Default Vault Debt Ceiling</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={supplyLimits.vaultDebtCeiling}
                    onChange={(e) => setSupplyLimits({ ...supplyLimits, vaultDebtCeiling: e.target.value })}
                    placeholder="10000000000"
                    className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-mono"
                  />
                  <button
                    onClick={handleSetVaultDebtCeiling}
                    disabled={loading || !wallet}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-sm font-medium transition-all"
                  >
                    Set
                  </button>
                </div>
                {protocolState && (
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    Current: {protocolState.defaultVaultDebtCeiling.toString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Role Management */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Role Management
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Target Account</label>
                <input
                  type="text"
                  value={roleManagement.targetAccount}
                  onChange={(e) => setRoleManagement({ ...roleManagement, targetAccount: e.target.value })}
                  placeholder="Public Key"
                  className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Role Type</label>
                <select
                  value={roleManagement.roleType}
                  onChange={(e) => setRoleManagement({ ...roleManagement, roleType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm"
                >
                  <option value="0">Guardian</option>
                  <option value="1">Oracle Authority</option>
                  <option value="2">Governance</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddRole}
                  disabled={loading || !wallet}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-sm font-medium transition-all"
                >
                  Add Role
                </button>
                <button
                  onClick={handleRemoveRole}
                  disabled={loading || !wallet}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 text-sm font-medium transition-all"
                >
                  Remove Role
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Controls - Full Width */}
      <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-red-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
        <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Emergency Controls
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="flex items-center gap-3 p-4 rounded-lg bg-black/20 border border-white/10 cursor-pointer hover:bg-black/30 transition-all">
              <input
                type="checkbox"
                checked={featureFlags.isProtocolPaused}
                onChange={(e) => setFeatureFlags({ ...featureFlags, isProtocolPaused: e.target.checked })}
                className="w-5 h-5 rounded bg-white/10 border-white/20 text-yellow-500 focus:ring-yellow-500"
              />
              <div>
                <div className="text-sm font-medium text-white">Protocol Paused</div>
                <div className="text-xs text-gray-500">Pause all operations</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-lg bg-black/20 border border-white/10 cursor-pointer hover:bg-black/30 transition-all">
              <input
                type="checkbox"
                checked={featureFlags.isMintPaused}
                onChange={(e) => setFeatureFlags({ ...featureFlags, isMintPaused: e.target.checked })}
                className="w-5 h-5 rounded bg-white/10 border-white/20 text-yellow-500 focus:ring-yellow-500"
              />
              <div>
                <div className="text-sm font-medium text-white">Mint Paused</div>
                <div className="text-xs text-gray-500">Pause minting</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-lg bg-black/20 border border-white/10 cursor-pointer hover:bg-black/30 transition-all">
              <input
                type="checkbox"
                checked={featureFlags.isRedeemPaused}
                onChange={(e) => setFeatureFlags({ ...featureFlags, isRedeemPaused: e.target.checked })}
                className="w-5 h-5 rounded bg-white/10 border-white/20 text-yellow-500 focus:ring-yellow-500"
              />
              <div>
                <div className="text-sm font-medium text-white">Redeem Paused</div>
                <div className="text-xs text-gray-500">Pause redemptions</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-lg bg-black/20 border border-red-500/30 cursor-pointer hover:bg-black/30 transition-all">
              <input
                type="checkbox"
                checked={featureFlags.isShutdown}
                onChange={(e) => setFeatureFlags({ ...featureFlags, isShutdown: e.target.checked })}
                className="w-5 h-5 rounded bg-white/10 border-white/20 text-red-500 focus:ring-red-500"
              />
              <div>
                <div className="text-sm font-medium text-red-400">Shutdown</div>
                <div className="text-xs text-gray-500">Emergency shutdown</div>
              </div>
            </label>
          </div>

          <button
            onClick={handleUpdateFeatureFlags}
            disabled={loading || !wallet}
            className="w-full mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 disabled:opacity-50 font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Update Feature Flags
          </button>
        </div>
      </div>
    </div>
  );
}
