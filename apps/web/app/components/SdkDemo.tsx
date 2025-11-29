"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Keypair } from "@solana/web3.js";
import { useAegis } from "../providers/aegis-sdk";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageAccountKeypair] = useState(() => Keypair.generate());
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [fetchedMessage, setFetchedMessage] = useState<string | null>(null);

  const handleInit = async () => {
    if (!client) return;
    setLoading(true);
    setTxSignature(null);
    try {
      const sig = await client.initMessage(messageAccountKeypair, message);
      setTxSignature(sig);
      console.log("Transaction signature", sig);
    } catch (err) {
      console.error("Error initializing message:", err);
      alert("Error initializing message. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async () => {
    if (!client) return;
    setLoading(true);
    try {
      const data = await client.fetchMessage(messageAccountKeypair.publicKey);
      setFetchedMessage(data.message);
    } catch (err) {
      console.error("Error fetching message:", err);
      alert("Error fetching message. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md mx-auto p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-white'>
      <div className='flex justify-between items-center mb-8'>
        <h2 className='text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600'>
          SDK Integration
        </h2>
        <div className='scale-75 origin-right'>
          <WalletMultiButton />
        </div>
      </div>

      <div className='space-y-6'>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-300 ml-1'>
            Message to Store
          </label>
          <input
            type='text'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Hello Solana!'
            className='w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600'
          />
        </div>

        <button
          onClick={handleInit}
          disabled={!wallet || loading || !message}
          className='w-full py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/20'
        >
          {loading ? "Processing..." : "Initialize Message on Chain"}
        </button>

        {txSignature && (
          <div className='p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm break-all'>
            <span className='font-semibold block mb-1'>
              Success! Signature:
            </span>
            {txSignature}
          </div>
        )}

        <div className='pt-6 border-t border-white/10'>
          <button
            onClick={handleFetch}
            disabled={!wallet || loading}
            className='w-full py-3 px-4 rounded-xl font-semibold bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
          >
            Fetch Stored Message
          </button>
        </div>

        {fetchedMessage && (
          <div className='p-4 rounded-xl bg-purple-500/10 border border-purple-500/20'>
            <span className='text-xs text-purple-300 uppercase tracking-wider font-semibold block mb-1'>
              Data from SDK
            </span>
            <p className='text-lg font-medium text-white'>{fetchedMessage}</p>
          </div>
        )}

        <div className='text-center pt-4'>
          <p className='text-xs text-gray-500 font-medium'>
            Powered by <span className='text-purple-400'>@aaegis/sdk</span>
          </p>
        </div>
      </div>
    </div>
  );
}
