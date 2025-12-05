"use client";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useAegis } from "../providers/aegis-sdk";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export default function SdkDemo() {
  const { client } = useAegis();
  const wallet = useAnchorWallet();
  const [treasuryInput, setTreasuryInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [protocolState, setProtocolState] = useState<any | null>(null);

  const handleInitProtocol = async () => {
    if (!client || !wallet) return;
    
    try {
      setLoading(true);
      setTxSignature(null);
      
      let treasuryPubkey: PublicKey;
      try {
        treasuryPubkey = new PublicKey(treasuryInput);
      } catch (e) {
        alert("Invalid Treasury Public Key");
        return;
      }

      const sig = await client.initializeProtocol(treasuryPubkey);
      setTxSignature(sig);
      console.log("Transaction signature", sig);
      
      // Auto-fetch state after success
      await handleFetchState();
    } catch (err) {
      console.error("Error initializing protocol:", err);
      alert("Error initializing protocol. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchState = async () => {
    if (!client) return;
    setLoading(true);
    try {
      const state = await client.fetchProtocolState();
      setProtocolState(state);
      console.log("Protocol State:", state);
    } catch (err) {
      console.error("Error fetching protocol state:", err);
      // Don't alert if it's just that the account doesn't exist yet
      if ((err as any).message?.includes("Account does not exist")) {
        setProtocolState(null);
      } else {
        alert("Error fetching protocol state. See console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full max-w-2xl mx-auto p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-white'>
      <div className='flex justify-between items-center mb-8'>
        <h2 className='text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600'>
          Protocol Management
        </h2>
        <div className='scale-75 origin-right'>
          <WalletMultiButton />
        </div>
      </div>

      <div className='space-y-8'>
        {/* Initialization Section */}
        <div className='space-y-4 p-6 rounded-xl bg-black/20 border border-white/5'>
          <h3 className='text-lg font-semibold text-purple-300'>Initialize Protocol</h3>
          
          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-300 ml-1'>
              Treasury Public Key
            </label>
            <input
              type='text'
              value={treasuryInput}
              onChange={(e) => setTreasuryInput(e.target.value)}
              placeholder='Enter Treasury Wallet Address'
              className='w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600 font-mono text-sm'
            />
          </div>

          <button
            onClick={handleInitProtocol}
            disabled={!wallet || loading || !treasuryInput}
            className='w-full py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/20'
          >
            {loading ? "Processing..." : "Initialize Protocol"}
          </button>

          {txSignature && (
            <div className='p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm break-all'>
              <span className='font-semibold block mb-1'>
                Success! Signature:
              </span>
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
        </div>

        {/* State Display Section */}
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h3 className='text-lg font-semibold text-blue-300'>Protocol State</h3>
            <button
              onClick={handleFetchState}
              disabled={!wallet || loading}
              className='px-4 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 transition-all'
            >
              Refresh State
            </button>
          </div>

          {protocolState ? (
            <div className='p-6 rounded-xl bg-blue-500/5 border border-blue-500/10 overflow-hidden'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-sm'>
                <div>
                  <h4 className='text-xs text-blue-300 uppercase tracking-wider font-semibold mb-3'>Authorities</h4>
                  <div className='space-y-2'>
                    <div className='flex flex-col'>
                      <span className='text-gray-500 text-xs'>Admin</span>
                      <span className='font-mono text-gray-300 truncate'>{protocolState.adminPubkey.toString()}</span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-gray-500 text-xs'>Treasury</span>
                      <span className='font-mono text-gray-300 truncate'>{protocolState.treasuryPubkey.toString()}</span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-gray-500 text-xs'>Governance</span>
                      <span className='font-mono text-gray-300 truncate'>{protocolState.governancePubkey.toString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className='text-xs text-blue-300 uppercase tracking-wider font-semibold mb-3'>Risk Parameters</h4>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Collateral Ratio</span>
                      <span className='text-white'>{(protocolState.baseCollateralRatioBps.toNumber() / 100).toFixed(2)}%</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Liq. Threshold</span>
                      <span className='text-white'>{(protocolState.baseLiquidationThresholdBps.toNumber() / 100).toFixed(2)}%</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Liq. Penalty</span>
                      <span className='text-white'>{(protocolState.baseLiquidationPenaltyBps.toNumber() / 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className='mt-6 pt-6 border-t border-white/5'>
                <h4 className='text-xs text-blue-300 uppercase tracking-wider font-semibold mb-3'>Supply Limits</h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                   <div className='flex flex-col'>
                      <span className='text-gray-500 text-xs'>Global Debt Ceiling</span>
                      <span className='text-white font-mono'>{protocolState.globalDebtCeiling.toString()}</span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-gray-500 text-xs'>Vault Debt Ceiling</span>
                      <span className='text-white font-mono'>{protocolState.defaultVaultDebtCeiling.toString()}</span>
                    </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='p-8 rounded-xl bg-white/5 border border-white/10 text-center text-gray-500'>
              Protocol not initialized or state not fetched
            </div>
          )}
        </div>

        <div className='text-center pt-4'>
          <p className='text-xs text-gray-500 font-medium'>
            Powered by <span className='text-purple-400'>@aaegis/sdk</span>
          </p>
        </div>
      </div>
    </div>
  );
}
