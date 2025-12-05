"use client";

import { useAegis } from "@/providers/wallet/aegis-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { formatAGSUSD } from "../../utils";

/**
 * Hook to fetch token balance using @aegis/sdk
 */
export function useTokenBalance(
  walletPubkey: string | null,
  refetchInterval?: number
) {
  const { client } = useAegis();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!walletPubkey || !client) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    try {
      // Get protocol state to get stablecoin mint address
      const protocolState = await client.fetchProtocolState();
      if (!protocolState || !protocolState.stablecoinMint) {
        console.warn("Protocol state or stablecoin mint not found");
        setBalance(0);
        return;
      }

      const stablecoinMint = protocolState.stablecoinMint as PublicKey;
      const ownerPubkey = new PublicKey(walletPubkey);

      // Get token balance (AGSUSD has 6 decimals)
      // Returns balance already in AGSUSD format (not units)
      const tokenBalance = await client.getTokenBalance(
        stablecoinMint,
        ownerPubkey,
        6 // AGSUSD decimals
      );

      console.log("Token balance fetched:", tokenBalance, "AGSUSD");
      setBalance(tokenBalance);
    } catch (error) {
      console.error("Failed to fetch token balance:", error);
      setBalance(0); // Set to 0 instead of null to show "0.00" instead of error
    } finally {
      setIsLoading(false);
    }
  }, [walletPubkey, client]);

  useEffect(() => {
    refetch();
    if (refetchInterval) {
      const interval = setInterval(refetch, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetch, refetchInterval]);

  // Format balance for display
  const balanceFormatted = useMemo(() => {
    if (balance === null || balance === undefined) return "0.00";
    return formatAGSUSD(balance);
  }, [balance]);

  return {
    balance,
    balanceFormatted,
    isLoading,
    refetch,
  };
}
