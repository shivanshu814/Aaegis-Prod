"use client";

import { useAegis } from "@/providers/wallet/aegis-sdk";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";

// SOL Native Mint Address
const SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

/**
 * Hook to fetch protocol state data from SDK (on-chain)
 */
export function useBackendProtocolStateData(refetchInterval?: number) {
  const { client } = useAegis();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchData = useCallback(async () => {
    if (!client) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const protocolState = await client.fetchProtocolState();

      // Helper to convert BN/number/bigint to number/string
      const toValue = (val: any): string | number => {
        if (!val && val !== 0) return "0";
        if (typeof val === "bigint") return Number(val).toString();
        if (val?.toString && typeof val.toString === "function") {
          // Handle BN objects
          return val.toString();
        }
        return typeof val === "number" ? val : Number(val) || 0;
      };

      // Transform to match expected format
      // Try both field name patterns (with and without 'base' prefix)
      const transformedData = {
        collateralRatioBps: toValue(
          protocolState.baseCollateralRatioBps || protocolState.collateralRatioBps
        ),
        liquidationThresholdBps: toValue(
          protocolState.baseLiquidationThresholdBps || protocolState.liquidationThresholdBps
        ),
        mintFeeBps:
          typeof protocolState.baseMintFeeBps === "number"
            ? protocolState.baseMintFeeBps
            : typeof protocolState.mintFeeBps === "number"
              ? protocolState.mintFeeBps
              : Number(toValue(protocolState.baseMintFeeBps || protocolState.mintFeeBps)) || 0,
        redeemFeeBps:
          typeof protocolState.baseRedeemFeeBps === "number"
            ? protocolState.baseRedeemFeeBps
            : typeof protocolState.redeemFeeBps === "number"
              ? protocolState.redeemFeeBps
              : Number(toValue(protocolState.baseRedeemFeeBps || protocolState.redeemFeeBps)) || 0,
        stabilityFeeBps:
          typeof protocolState.baseStabilityFeeBps === "number"
            ? protocolState.baseStabilityFeeBps
            : typeof protocolState.stabilityFeeBps === "number"
              ? protocolState.stabilityFeeBps
              : Number(toValue(protocolState.baseStabilityFeeBps || protocolState.stabilityFeeBps)) || 0,
      };

      setData(transformedData);
    } catch (err: any) {
      console.error("Error fetching protocol state:", err);
      setError(err);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    // Only fetch if client is available
    if (client) {
      fetchData();
    }

    if (refetchInterval && client) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [client, fetchData, refetchInterval]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook to fetch vault/position data for a specific owner from SDK (on-chain)
 */
export function useBackendVaultData(
  walletPubkey: string | null,
  refetchInterval?: number
) {
  const { client } = useAegis();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // Get SOL vault type
  const getSOLVaultType = useCallback(async (): Promise<PublicKey | null> => {
    if (!client) return null;

    try {
      const vaultTypes = await client.fetchAllVaultTypes();
      const solVaultType = vaultTypes.find(
        (vt: any) =>
          vt.account.collateralMint.toString() === SOL_MINT.toString()
      );

      return solVaultType?.publicKey || null;
    } catch (error: any) {
      console.error("Error fetching vault types:", error);
      return null;
    }
  }, [client]);

  const fetchData = useCallback(async () => {
    if (!client || !walletPubkey) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const vaultType = await getSOLVaultType();
      if (!vaultType) {
        setData(null);
        setIsLoading(false);
        return;
      }

      const ownerPubkey = new PublicKey(walletPubkey);
      const position = await client.fetchPosition(vaultType, ownerPubkey);

      if (!position) {
        setData(null);
        setIsLoading(false);
        return;
      }

      // Convert BN to string/number properly
      const collateralAmount =
        position.collateralAmount?.toString() ||
        position.collateralAmount?.toNumber?.()?.toString() ||
        "0";
      const debtAmount =
        position.debtAmount?.toString() ||
        position.debtAmount?.toNumber?.()?.toString() ||
        "0";
      const createdAt =
        position.createdAt?.toString() ||
        position.createdAt?.toNumber?.()?.toString() ||
        "0";

      // Transform to match expected format
      const transformedData = {
        owner: walletPubkey,
        collateralAmount: collateralAmount,
        debtAmount: debtAmount,
        createdAt: createdAt,
      };

      setData(transformedData);
    } catch (err: any) {
      console.error("Error fetching vault data:", err);
      setError(err);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [client, walletPubkey, getSOLVaultType]);

  useEffect(() => {
    // Only fetch if client and walletPubkey are available
    if (client && walletPubkey) {
      fetchData();
    }

    if (refetchInterval && client && walletPubkey) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [client, walletPubkey, fetchData, refetchInterval]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook to fetch oracle data from SDK (on-chain)
 */
export function useBackendOracleData(refetchInterval?: number) {
  const { client } = useAegis();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // Get SOL vault type and oracle
  const getSOLOracle = useCallback(async () => {
    if (!client) return null;

    try {
      const vaultTypes = await client.fetchAllVaultTypes();
      const solVaultType = vaultTypes.find(
        (vt: any) =>
          vt.account.collateralMint.toString() === SOL_MINT.toString()
      );

      if (!solVaultType) return null;

      return {
        vaultType: solVaultType.publicKey,
        oraclePubkey: solVaultType.account.oraclePriceAccount,
      };
    } catch (error: any) {
      console.error("Error fetching vault types:", error);
      return null;
    }
  }, [client]);

  const fetchData = useCallback(async () => {
    if (!client) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const oracleInfo = await getSOLOracle();
      if (!oracleInfo) {
        setData(null);
        setIsLoading(false);
        return;
      }

      // Fetch price from oracle
      // SDK returns price already divided by 1_000_000 (USD format)
      // But utility functions expect raw price with decimals
      const priceUSD = await client.getOraclePrice(oracleInfo.oraclePubkey);

      if (priceUSD === null) {
        // Fallback to CoinGecko for SOL if on-chain fails
        try {
          const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
          );
          const coingeckoData = await response.json();
          if (coingeckoData.solana?.usd) {
            const fallbackPriceUSD = coingeckoData.solana.usd;
            // Convert USD price to raw format with 6 decimals
            const rawPrice = Math.floor(fallbackPriceUSD * 1_000_000);
            setData({
              price: rawPrice,
              priceDecimals: 6,
              lastUpdated: Date.now(),
            });
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error("Fallback price fetch failed", e);
        }
        setData(null);
        setIsLoading(false);
        return;
      }

      // Convert USD price back to raw format with 6 decimals for utility functions
      // Utility functions will divide by 10^6 again, so we need raw value
      const rawPrice = Math.floor(priceUSD * 1_000_000);

      // Transform to match expected format
      const transformedData = {
        price: rawPrice, // Raw price value with 6 decimals (e.g., 150000000 for $150)
        priceDecimals: 6,
        lastUpdated: Date.now(), // We don't have lastUpdated from SDK, using current time
      };

      setData(transformedData);
    } catch (err: any) {
      console.error("Error fetching oracle data:", err);
      setError(err);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [client, getSOLOracle]);

  useEffect(() => {
    // Only fetch if client is available
    if (client) {
      fetchData();
    }

    if (refetchInterval && client) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [client, fetchData, refetchInterval]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
