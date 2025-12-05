"use client";

import { useAegis } from "@/providers/wallet/aegis-sdk";
import { useConnection } from "@solana/wallet-adapter-react";

/**
 * Hook to access SDK client and connection
 */
export function useSDK() {
  const { client } = useAegis();
  const { connection } = useConnection();

  return {
    client,
    connection,
    isReady: !!client && !!connection,
  };
}
