"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useMemo } from "react";

/**
 * Hook for wallet connection
 * Uses @solana/wallet-adapter-react instead of @aegis/ui
 */
export function useWalletConnection() {
  const { publicKey, connecting, connected, disconnect } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();

  const walletPubkey = useMemo(() => {
    return publicKey ? publicKey.toString() : null;
  }, [publicKey]);

  const connectWallet = () => {
    // Open wallet modal
    setVisible(true);
  };

  const isSDKReady = useMemo(() => {
    return connected && !!publicKey && !!connection;
  }, [connected, publicKey, connection]);

  return {
    walletPubkey,
    publicKey,
    connecting,
    connected,
    disconnect,
    connectWallet,
    isSDKReady,
    connection,
    error: null, // Wallet adapter handles errors internally
  };
}
