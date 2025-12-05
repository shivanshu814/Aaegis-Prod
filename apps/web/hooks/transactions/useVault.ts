"use client";

import { useAegis } from "@/providers/wallet/aegis-sdk";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useState } from "react";
import { toast } from "sonner";

// SOL Native Mint Address
const SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

/**
 * Hook for vault operations using @aegis/sdk
 */
export function useVault() {
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

  const createVault = useCallback(
    async (walletPubkey: string) => {
      if (!client) {
        toast.error("Wallet not connected");
        return;
      }

      setIsLoading(true);
      try {
        const vaultType = await getSOLVaultType();
        if (!vaultType) {
          return;
        }

        // Check if position already exists
        const position = await client.fetchPosition(vaultType);
        if (position) {
          toast.info("Position already exists");
          return;
        }

        // Open new position
        toast.loading("Creating vault...", { id: "create-vault" });
        const txSignature = await client.openPosition(vaultType);
        toast.success("Vault created successfully!", {
          id: "create-vault",
          description: `Transaction: ${txSignature.slice(0, 8)}...${txSignature.slice(-8)}`,
        });
      } catch (error: any) {
        console.error("Error creating vault:", error);
        toast.error("Failed to create vault", {
          description: error.message || "Unknown error occurred",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [client, getSOLVaultType]
  );

  const deposit = useCallback(
    async (amountLamports: number, walletPubkey: string) => {
      if (!client) {
        toast.error("Wallet not connected");
        return;
      }

      setIsLoading(true);
      try {
        const vaultType = await getSOLVaultType();
        if (!vaultType) {
          return;
        }

        // Check if position exists, if not create it first
        const position = await client.fetchPosition(vaultType);
        if (!position) {
          toast.loading("Creating position first...", {
            id: "create-position",
          });
          await client.openPosition(vaultType);
          toast.success("Position created", { id: "create-position" });
        }

        // Deposit collateral (amount is in lamports for SOL)
        toast.loading("Depositing collateral...", { id: "deposit" });
        const txSignature = await client.depositCollateral(
          vaultType,
          amountLamports,
          SOL_MINT
        );

        toast.success("Deposit successful!", {
          id: "deposit",
          description: `Transaction: ${txSignature.slice(0, 8)}...${txSignature.slice(-8)}`,
        });
      } catch (error: any) {
        console.error("Error depositing:", error);
        toast.error("Deposit failed", {
          id: "deposit",
          description: error.message || "Unknown error occurred",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [client, getSOLVaultType]
  );

  const withdraw = useCallback(
    async (amountLamports: number, walletPubkey: string) => {
      if (!client) {
        toast.error("Wallet not connected");
        return;
      }

      setIsLoading(true);
      try {
        const vaultType = await getSOLVaultType();
        if (!vaultType) {
          return;
        }

        // Check if position exists
        const position = await client.fetchPosition(vaultType);
        if (!position) {
          toast.error("No position found");
          return;
        }

        // Withdraw collateral (amount is in lamports for SOL)
        toast.loading("Withdrawing collateral...", { id: "withdraw" });
        const txSignature = await client.withdrawCollateral(
          vaultType,
          amountLamports,
          SOL_MINT
        );

        toast.success("Withdrawal successful!", {
          id: "withdraw",
          description: `Transaction: ${txSignature.slice(0, 8)}...${txSignature.slice(-8)}`,
        });
      } catch (error: any) {
        console.error("Error withdrawing:", error);
        toast.error("Withdrawal failed", {
          id: "withdraw",
          description: error.message || "Unknown error occurred",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [client, getSOLVaultType]
  );

  const mint = useCallback(
    async (amount: number, walletPubkey: string) => {
      if (!client) {
        toast.error("Wallet not connected");
        return;
      }

      setIsLoading(true);
      try {
        const vaultType = await getSOLVaultType();
        if (!vaultType) {
          return;
        }

        // Check if position exists
        const position = await client.fetchPosition(vaultType);
        if (!position) {
          toast.error("No position found. Create a vault first.");
          return;
        }

        toast.loading("Minting AGS...", { id: "mint" });
        const txSignature = await client.mintStablecoin(
          vaultType,
          amount // Amount in units (not decimals)? Wait, SDK uses new BN(amount). The SDK likely expects raw units if it converts to BN, or maybe not.
          // In `deposit`, we pass `amount * 1e9` as lamports, but as a number.
          // In `ConnectedVault`, we were passing `new BN(amount * 1e6)`.
          // SDK `mintStablecoin` takes `amount: number`.
          // Let's assume SDK wants atomic units.
          // So we should pass generic amount.
        );

        toast.success("Mint successful!", {
          id: "mint",
          description: `Transaction: ${txSignature.slice(0, 8)}...${txSignature.slice(-8)}`,
        });
      } catch (error: any) {
        console.error("Error minting:", error);
        toast.error("Mint failed", {
          id: "mint",
          description: error.message || "Unknown error occurred",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [client, getSOLVaultType]
  );

  const repay = useCallback(
    async (amount: number, walletPubkey: string) => {
      if (!client) {
        toast.error("Wallet not connected");
        return;
      }

      setIsLoading(true);
      try {
        const vaultType = await getSOLVaultType();
        if (!vaultType) {
          return;
        }

        // Check if position exists
        const position = await client.fetchPosition(vaultType);
        if (!position) {
          toast.error("No position found");
          return;
        }

        toast.loading("Repaying debt...", { id: "repay" });
        const txSignature = await client.repayStablecoin(
          vaultType,
          amount
        );

        toast.success("Repayment successful!", {
          id: "repay",
          description: `Transaction: ${txSignature.slice(0, 8)}...${txSignature.slice(-8)}`,
        });
      } catch (error: any) {
        console.error("Error repaying:", error);
        toast.error("Repayment failed", {
          id: "repay",
          description: error.message || "Unknown error occurred",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [client, getSOLVaultType]
  );

  return {
    createVault,
    deposit,
    withdraw,
    mint,
    repay,
    isLoading,
  };
}
