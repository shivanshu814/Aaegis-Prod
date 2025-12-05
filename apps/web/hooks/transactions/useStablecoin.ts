"use client";

import { useAegis } from "@/providers/wallet/aegis-sdk";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useState } from "react";
import { toast } from "sonner";

// SOL Native Mint Address
const SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

/**
 * Hook for stablecoin operations (mint/redeem) using @aegis/sdk
 */
export function useStablecoin() {
  const { client } = useAegis();
  const [isLoading, setIsLoading] = useState(false);

  // Get SOL vault type
  const getSOLVaultType = useCallback(async (): Promise<PublicKey | null> => {
    if (!client) return null;

    try {
      const vaultTypes = await client.fetchAllVaultTypes();
      const solVaultType = vaultTypes.find(
        (vt: any) =>
          vt.account.collateralMint.toString() === SOL_MINT.toString()
      );

      if (!solVaultType) {
        toast.error("SOL vault type not found");
        return null;
      }

      return solVaultType.publicKey;
    } catch (error: any) {
      console.error("Error fetching vault types:", error);
      toast.error("Failed to fetch vault types");
      return null;
    }
  }, [client]);

  const mintStablecoin = useCallback(
    async (
      amountAGSUSD: number,
      walletPubkey: string
    ): Promise<string | null> => {
      if (!client) {
        toast.error("Wallet not connected");
        return null;
      }

      setIsLoading(true);
      try {
        const vaultType = await getSOLVaultType();
        if (!vaultType) {
          return null;
        }

        // Check if position exists
        const position = await client.fetchPosition(vaultType);
        if (!position) {
          toast.error("Please deposit collateral first");
          return null;
        }

        // Mint stablecoin (amountAGSUSD is in micro-AGSUSD units, 6 decimals)
        toast.loading("Minting stablecoin...", { id: "mint" });
        const txSignature = await client.mintStablecoin(
          vaultType,
          amountAGSUSD
        );

        toast.success("Stablecoin minted successfully!", {
          id: "mint",
          description: `Transaction: ${txSignature.slice(0, 8)}...${txSignature.slice(-8)}`,
        });

        return txSignature;
      } catch (error: any) {
        console.error("Error minting stablecoin:", error);
        toast.error("Mint failed", {
          id: "mint",
          description: error.message || "Unknown error occurred",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client, getSOLVaultType]
  );

  const redeemStablecoin = useCallback(
    async (
      amountAGSUSD: number,
      walletPubkey: string
    ): Promise<string | null> => {
      if (!client) {
        toast.error("Wallet not connected");
        return null;
      }

      setIsLoading(true);
      try {
        const vaultType = await getSOLVaultType();
        if (!vaultType) {
          return null;
        }

        // Check if position exists
        const position = await client.fetchPosition(vaultType);
        if (!position) {
          toast.error("No position found. Please deposit collateral first");
          return null;
        }

        // Repay stablecoin debt (amountAGSUSD is in micro-AGSUSD units, 6 decimals)
        toast.loading("Repaying stablecoin debt...", { id: "repay" });
        const txSignature = await client.repayStablecoin(
          vaultType,
          amountAGSUSD
        );

        toast.success("Debt repaid successfully!", {
          id: "repay",
          description: `Transaction: ${txSignature.slice(0, 8)}...${txSignature.slice(-8)}`,
        });

        return txSignature;
      } catch (error: any) {
        console.error("Error repaying stablecoin:", error);
        toast.error("Repay failed", {
          id: "repay",
          description: error.message || "Unknown error occurred",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client, getSOLVaultType]
  );

  return {
    mintStablecoin,
    redeemStablecoin,
    isLoading,
  };
}
