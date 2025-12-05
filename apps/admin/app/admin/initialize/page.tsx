"use client";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAegis } from "../../providers/aegis-sdk";

export default function InitializePage() {
  const { client } = useAegis();
  const wallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [protocolState, setProtocolState] = useState<any>(null);

  const [treasury, setTreasury] = useState("");
  const [stablecoinMint, setStablecoinMint] = useState("");

  useEffect(() => {
    checkInitialization();
  }, [client]);

  const checkInitialization = async () => {
    if (!client) return;
    try {
      const state = await client.fetchProtocolState();
      setProtocolState(state);
      setIsInitialized(true);
    } catch (e) {
      setIsInitialized(false);
    }
  };

  const handleInitialize = async () => {
    if (!client || !wallet) return;
    setLoading(true);
    const toastId = toast.loading("Initializing protocol...");
    try {
      let treasuryKey: PublicKey;
      try {
        treasuryKey = new PublicKey(treasury);
      } catch (e) {
        toast.error("Invalid Treasury Public Key", { id: toastId });
        return;
      }

      const sig = await client.initializeProtocol(treasuryKey);
      console.log("Initialized:", sig);

      await checkInitialization();
      toast.success("Protocol Initialized Successfully! Now set the stablecoin mint.", { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error("Error initializing protocol", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleSetStablecoin = async () => {
    if (!client || !wallet) return;
    setLoading(true);
    const toastId = toast.loading("Setting stablecoin mint...");
    try {
      let mintKey: PublicKey;
      try {
        mintKey = new PublicKey(stablecoinMint);
      } catch (e) {
        toast.error("Invalid Mint Public Key", { id: toastId });
        return;
      }

      const tx = await client.setStablecoinMint(mintKey);
      console.log("Stablecoin Mint Set:", tx);

      await checkInitialization();
      toast.success("Stablecoin Mint Set Successfully!", { id: toastId });
    } catch (e: any) {
      console.error(e);
      toast.error(`Error: ${e.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const isStablecoinSet = protocolState &&
    protocolState.stablecoinMint.toString() !== "11111111111111111111111111111111";

  return (
    <div className="p-8 text-white max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 gradient-text">
        Protocol Setup
      </h1>

      <div className="space-y-8">
        {/* Step 1: Initialize */}
        <div className={`glass border ${isInitialized ? "border-green-500/50" : "border-white/10"} rounded-2xl p-8 transition-all`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">1. Initialize Protocol</h2>
            {isInitialized && <span className="text-2xl">✅</span>}
          </div>

          {isInitialized ? (
            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200">
              Protocol is initialized.
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Treasury Public Key</label>
                <input
                  type="text"
                  value={treasury}
                  onChange={e => setTreasury(e.target.value)}
                  placeholder="Enter Treasury Wallet Address"
                  className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 outline-none transition-all font-mono text-sm"
                />
              </div>

              <button
                onClick={handleInitialize}
                disabled={loading || !wallet || !treasury}
                className="w-full py-3 px-4 rounded-xl font-semibold btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Initializing..." : "Initialize Protocol"}
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Set Stablecoin Mint */}
        <div className={`glass border ${isStablecoinSet ? "border-green-500/50" : "border-white/10"} rounded-2xl p-8 transition-all ${!isInitialized ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">2. Set Stablecoin Mint</h2>
            {isStablecoinSet && <span className="text-2xl">✅</span>}
          </div>

          {isStablecoinSet ? (
            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200">
              Stablecoin Mint: <span className="font-mono text-sm">{protocolState.stablecoinMint.toString()}</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">AGSUSD Mint Address</label>
                <input
                  type="text"
                  value={stablecoinMint}
                  onChange={e => setStablecoinMint(e.target.value)}
                  placeholder="Enter AGSUSD Mint Address"
                  className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 outline-none transition-all font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Create this in the Tokens page first if you haven't already.
                </p>
              </div>

              <button
                onClick={handleSetStablecoin}
                disabled={loading || !wallet || !stablecoinMint}
                className="w-full py-3 px-4 rounded-xl font-semibold btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Setting Mint..." : "Set Stablecoin Mint"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
