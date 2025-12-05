"use client";

import { createMetadataAccountV3 } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import base58 from "bs58";
import { useState } from "react";

export default function TokensPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [stablecoinMint, setStablecoinMint] = useState("");
  const [governanceMint, setGovernanceMint] = useState("");

  const handleCreateStablecoin = async () => {
    if (!wallet.publicKey || !connection) {
      alert("Please connect your wallet");
      return;
    }

    setLoading(true);
    try {
      // Generate a new keypair for the mint
      const mintKeypair = Keypair.generate();

      // Calculate rent exemption
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          6, // decimals
          wallet.publicKey, // mint authority
          wallet.publicKey, // freeze authority
          TOKEN_PROGRAM_ID
        )
      );

      // Send transaction
      const signature = await wallet.sendTransaction(transaction, connection, {
        signers: [mintKeypair],
      });

      await connection.confirmTransaction(signature, "confirmed");

      const mintAddress = mintKeypair.publicKey.toString();
      setStablecoinMint(mintAddress);
      alert(`AGSUSD Mint Created!\n\nMint Address: ${mintAddress}\n\n⚠️ Important: Transfer mint authority to protocol PDA after initialization!`);

      // Save to localStorage for convenience
      localStorage.setItem("agsusd_mint", mintAddress);
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGovernance = async () => {
    if (!wallet.publicKey || !connection) {
      alert("Please connect your wallet");
      return;
    }

    setLoading(true);
    try {
      // Generate a new keypair for the mint
      const mintKeypair = Keypair.generate();

      // Calculate rent exemption
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          9, // decimals
          wallet.publicKey, // mint authority
          wallet.publicKey, // freeze authority
          TOKEN_PROGRAM_ID
        )
      );

      // Send transaction
      const signature = await wallet.sendTransaction(transaction, connection, {
        signers: [mintKeypair],
      });

      await connection.confirmTransaction(signature, "confirmed");

      const mintAddress = mintKeypair.publicKey.toString();
      setGovernanceMint(mintAddress);
      alert(`AGS Governance Token Created!\n\nMint Address: ${mintAddress}`);

      // Save to localStorage
      localStorage.setItem("ags_mint", mintAddress);
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMetadata = async (mintAddress: string, name: string, symbol: string, uri: string) => {
    if (!wallet.publicKey || !connection) {
      alert("Please connect your wallet");
      return;
    }

    setLoading(true);
    try {
      // Initialize Umi
      const umi = createUmi(connection.rpcEndpoint)
        .use(walletAdapterIdentity(wallet));

      const mint = publicKey(mintAddress);

      // Create metadata
      const { signature } = await createMetadataAccountV3(umi, {
        mint,
        mintAuthority: umi.identity,
        payer: umi.identity,
        updateAuthority: umi.identity.publicKey,
        data: {
          name,
          symbol,
          uri,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
        isMutable: true,
        collectionDetails: null,
      }).sendAndConfirm(umi);

      alert(`Metadata added successfully!\nSignature: ${base58.encode(signature)}`);
    } catch (e: any) {
      console.error(e);
      alert(`Error adding metadata: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 text-white max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
        Token Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Stablecoin Section */}
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8">
          <div className="text-5xl mb-4">💵</div>
          <h2 className="text-3xl font-bold mb-4">AGSUSD Stablecoin</h2>
          <p className="text-gray-400 mb-6">USD-pegged stablecoin for the Aegis Protocol</p>

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-xl bg-black/20">
              <p className="text-sm text-gray-400 mb-1">Decimals</p>
              <p className="text-xl font-semibold">6</p>
            </div>
            <div className="p-4 rounded-xl bg-black/20">
              <p className="text-sm text-gray-400 mb-1">Symbol</p>
              <p className="text-xl font-semibold">AGSUSD</p>
            </div>
            <div className="p-4 rounded-xl bg-black/20">
              <p className="text-sm text-gray-400 mb-1">Mint Authority</p>
              <p className="text-sm font-mono">Protocol PDA (after setup)</p>
            </div>
          </div>

          {stablecoinMint && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-400 mb-2">✅ Mint Created</p>
              <p className="text-xs font-mono break-all text-white">{stablecoinMint}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleCreateStablecoin}
              disabled={loading || !wallet.publicKey || !!stablecoinMint}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : stablecoinMint ? "Mint Created" : "Create AGSUSD Mint"}
            </button>

            {stablecoinMint && (
              <button
                onClick={() => handleAddMetadata(
                  stablecoinMint,
                  "AGS USD",
                  "AGSUSD",
                  "https://raw.githubusercontent.com/Aageis-Finance/aaegis-token-metadata/refs/heads/main/token-metadata.json"
                )}
                disabled={loading || !wallet.publicKey}
                className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
              >
                Add Metadata
              </button>
            )}
          </div>
        </div>

        {/* Governance Token Section */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8">
          <div className="text-5xl mb-4">🏛️</div>
          <h2 className="text-3xl font-bold mb-4">AGS Governance</h2>
          <p className="text-gray-400 mb-6">Governance & utility token for Aaegis Protocol</p>

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-xl bg-black/20">
              <p className="text-sm text-gray-400 mb-1">Decimals</p>
              <p className="text-xl font-semibold">9</p>
            </div>
            <div className="p-4 rounded-xl bg-black/20">
              <p className="text-sm text-gray-400 mb-1">Symbol</p>
              <p className="text-xl font-semibold">AGS</p>
            </div>
            <div className="p-4 rounded-xl bg-black/20">
              <p className="text-sm text-gray-400 mb-1">Mint Authority</p>
              <p className="text-sm font-mono">Admin Wallet</p>
            </div>
          </div>

          {governanceMint && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-400 mb-2">✅ Mint Created</p>
              <p className="text-xs font-mono break-all text-white">{governanceMint}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleCreateGovernance}
              disabled={loading || !wallet.publicKey || !!governanceMint}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : governanceMint ? "Mint Created" : "Create AGS Token"}
            </button>

            {governanceMint && (
              <button
                onClick={() => handleAddMetadata(
                  governanceMint,
                  "Aaegis Finance",
                  "AGS",
                  "https://raw.githubusercontent.com/Aageis-Finance/aaegis-token-metadata/refs/heads/main/ags-token-metadata.json"
                )}
                disabled={loading || !wallet.publicKey}
                className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
              >
                Add Metadata
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-12 p-8 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-2xl font-bold mb-6">Setup Instructions</h3>
        <ol className="space-y-4 text-gray-300">
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">1</span>
            <div>
              <p className="font-semibold text-white mb-1">Create AGSUSD Stablecoin</p>
              <p className="text-sm text-gray-400">Creates the mint with 6 decimals. Initially your wallet has mint authority.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">2</span>
            <div>
              <p className="font-semibold text-white mb-1">Initialize Protocol</p>
              <p className="text-sm text-gray-400">Go to Initialize page and set up the protocol with AGSUSD mint address.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">3</span>
            <div>
              <p className="font-semibold text-white mb-1">Transfer Mint Authority</p>
              <p className="text-sm text-gray-400">After initialization, transfer AGSUSD mint authority to protocol PDA (mint_authority).</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">4</span>
            <div>
              <p className="font-semibold text-white mb-1">Create AGS Token (Optional)</p>
              <p className="text-sm text-gray-400">Create the governance token for future use. Keep mint authority with admin wallet.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold">5</span>
            <div>
              <p className="font-semibold text-white mb-1">Add Metadata (Advanced)</p>
              <p className="text-sm text-gray-400">Use the "Add Metadata" button to attach logo and description to your tokens.</p>
            </div>
          </li>
        </ol>
      </div>

      {/* Metadata Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
          <h4 className="font-bold text-cyan-400 mb-3">AGSUSD Metadata</h4>
          <div className="text-sm space-y-2 text-gray-300">
            <p><span className="text-gray-500">Name:</span> AGS USD</p>
            <p><span className="text-gray-500">Symbol:</span> AGSUSD</p>
            <p><span className="text-gray-500">Description:</span> USD-pegged stablecoin of the Aaegis Protocol on Solana.</p>
            <p className="text-xs break-all"><span className="text-gray-500">Image:</span> https://avatars.githubusercontent.com/u/235737903?s=200...</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/20">
          <h4 className="font-bold text-purple-400 mb-3">AGS Metadata</h4>
          <div className="text-sm space-y-2 text-gray-300">
            <p><span className="text-gray-500">Name:</span> Aaegis Finance</p>
            <p><span className="text-gray-500">Symbol:</span> AGS</p>
            <p><span className="text-gray-500">Description:</span> Governance & utility token for the Aaegis Protocol.</p>
            <p className="text-xs break-all"><span className="text-gray-500">Image:</span> https://avatars.githubusercontent.com/u/235737903?s=200...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
