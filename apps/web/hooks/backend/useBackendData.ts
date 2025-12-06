"use client";

import { trpc } from "@/providers/query/trpc";
import { useAegis } from "@/providers/wallet/aegis-sdk";
import { BackendOracleData, BackendProtocolStateData, BackendVaultData } from "@/types";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";

// SOL Native Mint Address
const SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

// Cache refresh interval (5 minutes for frontend, backend syncs more frequently)
const CACHE_REFRESH_INTERVAL = 5 * 60 * 1000;

/**
 * Hook to fetch protocol state data from CACHED DB (via backend)
 * Falls back to SDK if backend unavailable
 */
export function useBackendProtocolStateData(refetchInterval?: number): {
  data: BackendProtocolStateData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isCached: boolean;
} {
  // Try to get from cached DB first
  const { data: cachedData, isLoading: cacheLoading, refetch: refetchCache } =
    trpc.protocol.getStats.useQuery(undefined, {
      refetchInterval: refetchInterval || CACHE_REFRESH_INTERVAL,
      staleTime: 60 * 1000,
      retry: 1,
    });

  const { client } = useAegis();
  const [sdkData, setSDKData] = useState<BackendProtocolStateData | null>(null);
  const [sdkLoading, setSDKLoading] = useState(false);
  const [sdkError, setSDKError] = useState<Error | null>(null);

  // Fallback to SDK if cached data is not available
  const fetchFromSDK = useCallback(async () => {
    if (!client) return;

    setSDKLoading(true);
    setSDKError(null);
    try {
      const protocolState = await client.fetchProtocolState();

      const toValue = (val: unknown): string | number => {
        if (!val && val !== 0) return "0";
        if (typeof val === "bigint") return Number(val).toString();
        if (val && typeof val === "object" && "toString" in val && typeof val.toString === "function") {
          return val.toString();
        }
        return typeof val === "number" ? val : Number(val) || 0;
      };

      const state = protocolState as Record<string, unknown>;
      const transformedData: BackendProtocolStateData = {
        collateralRatioBps: toValue(state.baseCollateralRatioBps || state.collateralRatioBps),
        liquidationThresholdBps: toValue(state.baseLiquidationThresholdBps || state.liquidationThresholdBps),
        mintFeeBps: Number(toValue(state.baseMintFeeBps || state.mintFeeBps)) || 0,
        redeemFeeBps: Number(toValue(state.baseRedeemFeeBps || state.redeemFeeBps)) || 0,
        stabilityFeeBps: Number(toValue(state.baseStabilityFeeBps || state.stabilityFeeBps)) || 0,
      };

      setSDKData(transformedData);
    } catch (err) {
      console.error("Error fetching protocol state from SDK:", err);
      setSDKError(err as Error);
    } finally {
      setSDKLoading(false);
    }
  }, [client]);

  // If cached data is available, transform it
  const transformedCachedData: BackendProtocolStateData | null = cachedData ? {
    collateralRatioBps: String((cachedData as Record<string, unknown>).baseCollateralRatioBps || 0),
    liquidationThresholdBps: String((cachedData as Record<string, unknown>).baseLiquidationThresholdBps || 0),
    mintFeeBps: Number((cachedData as Record<string, unknown>).baseMintFeeBps) || 0,
    redeemFeeBps: Number((cachedData as Record<string, unknown>).baseRedeemFeeBps) || 0,
    stabilityFeeBps: Number((cachedData as Record<string, unknown>).baseStabilityFeeBps) || 0,
  } : null;

  // Use cached data if available, otherwise fallback to SDK
  const data = transformedCachedData || sdkData;
  const isLoading = cacheLoading || sdkLoading;
  const error = sdkError;

  // Fallback to SDK if cache fails
  useEffect(() => {
    if (!cachedData && !cacheLoading && client) {
      fetchFromSDK();
    }
  }, [cachedData, cacheLoading, client, fetchFromSDK]);

  return {
    data,
    isLoading,
    error,
    refetch: refetchCache,
    isCached: !!transformedCachedData,
  };
}

/**
 * Hook to fetch vault/position data for a specific owner
 * Uses cached DB data with SDK fallback
 */
export function useBackendVaultData(
  walletPubkey: string | null,
  refetchInterval?: number
): {
  data: BackendVaultData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isCached: boolean;
} {
  // Try to get from cached DB first
  const { data: cachedPosition, isLoading: cacheLoading, refetch: refetchCache } =
    trpc.positions.getByOwner.useQuery(
      { owner: walletPubkey || "" },
      {
        enabled: !!walletPubkey,
        refetchInterval: refetchInterval || CACHE_REFRESH_INTERVAL,
        staleTime: 60 * 1000,
        retry: 1,
      }
    );

  const { client } = useAegis();
  const [sdkData, setSDKData] = useState<BackendVaultData | null>(null);
  const [sdkLoading, setSDKLoading] = useState(false);
  const [sdkError, setSDKError] = useState<Error | null>(null);

  // Get SOL vault type
  const getSOLVaultType = useCallback(async (): Promise<PublicKey | null> => {
    if (!client) return null;

    try {
      const vaultTypes = await client.fetchAllVaultTypes();
      const solVaultType = (vaultTypes as Array<{ publicKey: PublicKey; account: { collateralMint: PublicKey } }>).find(
        (vt) => vt.account.collateralMint.toString() === SOL_MINT.toString()
      );
      return solVaultType?.publicKey || null;
    } catch (error) {
      console.error("Error fetching vault types:", error);
      return null;
    }
  }, [client]);

  // Fallback to SDK
  const fetchFromSDK = useCallback(async () => {
    if (!client || !walletPubkey) return;

    setSDKLoading(true);
    setSDKError(null);
    try {
      const vaultType = await getSOLVaultType();
      if (!vaultType) {
        setSDKData(null);
        return;
      }

      const ownerPubkey = new PublicKey(walletPubkey);
      const position = await client.fetchPosition(vaultType, ownerPubkey);

      if (!position) {
        setSDKData(null);
        return;
      }

      const pos = position as Record<string, unknown>;
      const collateralAmount = String(pos.collateralAmount) || "0";
      const debtAmount = String(pos.debtAmount) || "0";
      const createdAt = String(pos.createdAt) || "0";

      setSDKData({
        owner: walletPubkey,
        collateralAmount,
        debtAmount,
        createdAt,
      });
    } catch (err) {
      console.error("Error fetching vault data from SDK:", err);
      setSDKError(err as Error);
      setSDKData(null);
    } finally {
      setSDKLoading(false);
    }
  }, [client, walletPubkey, getSOLVaultType]);

  // Transform cached position data
  const posArray = cachedPosition as unknown[];
  const transformedCachedData: BackendVaultData | null = posArray && posArray.length > 0
    ? {
      owner: walletPubkey || "",
      collateralAmount: String((posArray[0] as Record<string, unknown>).collateralAmount || 0),
      debtAmount: String((posArray[0] as Record<string, unknown>).debtAmount || 0),
      createdAt: String((posArray[0] as Record<string, unknown>).updatedAt || 0),
    }
    : null;

  const data = transformedCachedData || sdkData;
  const isLoading = cacheLoading || sdkLoading;
  const error = sdkError;

  // Fallback to SDK if cache fails
  useEffect(() => {
    if (!cachedPosition && !cacheLoading && client && walletPubkey) {
      fetchFromSDK();
    }
  }, [cachedPosition, cacheLoading, client, walletPubkey, fetchFromSDK]);

  return {
    data,
    isLoading,
    error,
    refetch: refetchCache,
    isCached: !!transformedCachedData,
  };
}

/**
 * Hook to fetch oracle data from SDK (on-chain) with caching
 */
export function useBackendOracleData(refetchInterval?: number): {
  data: BackendOracleData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { client } = useAegis();
  const [data, setData] = useState<BackendOracleData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get SOL vault type and oracle
  const getSOLOracle = useCallback(async () => {
    if (!client) return null;

    try {
      const vaultTypes = await client.fetchAllVaultTypes();
      const solVaultType = (vaultTypes as Array<{ publicKey: PublicKey; account: { collateralMint: PublicKey; oraclePriceAccount: PublicKey } }>).find(
        (vt) => vt.account.collateralMint.toString() === SOL_MINT.toString()
      );

      if (!solVaultType) return null;

      return {
        vaultType: solVaultType.publicKey,
        oraclePubkey: solVaultType.account.oraclePriceAccount,
      };
    } catch (error) {
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

      const rawPrice = Math.floor(priceUSD * 1_000_000);

      setData({
        price: rawPrice,
        priceDecimals: 6,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      console.error("Error fetching oracle data:", err);
      setError(err as Error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [client, getSOLOracle]);

  useEffect(() => {
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
 * Hook to get all vaults from cached DB
 */
export function useBackendVaultsData(): {
  data: unknown;
  isLoading: boolean;
  refetch: () => void;
} {
  const { data, isLoading, refetch } = trpc.vaults.getAll.useQuery(undefined, {
    refetchInterval: CACHE_REFRESH_INTERVAL,
    staleTime: 2 * 60 * 1000,
  });

  return {
    data,
    isLoading,
    refetch,
  };
}

/**
 * Hook for pre-transaction refresh
 * Call before any on-chain action (mint, redeem, etc.)
 */
export function usePreTransactionRefresh(): {
  refresh: () => Promise<boolean>;
  isRefreshing: boolean;
} {
  const utils = trpc.useUtils();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Invalidate frontend cache to get fresh data
      await utils.protocol.getStats.invalidate();
      await utils.vaults.getAll.invalidate();
      await utils.positions.invalidate();
      return true;
    } catch (error) {
      console.error("Pre-transaction refresh failed:", error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [utils]);

  return {
    refresh,
    isRefreshing,
  };
}

/**
 * Hook to get live analytics data from DB
 */
export function useBackendAnalytics(): {
  data: unknown;
  isLoading: boolean;
  refetch: () => void;
} {
  const { data, isLoading, refetch } = trpc.analytics.getLiveStats.useQuery(undefined, {
    refetchInterval: CACHE_REFRESH_INTERVAL,
    staleTime: 60 * 1000,
  });

  return {
    data,
    isLoading,
    refetch,
  };
}
