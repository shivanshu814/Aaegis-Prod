"use client";

import { useCallback } from "react";
import { trpc } from "../providers/trpc";

// Refresh intervals
const PROTOCOL_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes for frontend

/**
 * Hook to get cached protocol state from DB
 * Updates every 5 minutes automatically
 */
export function useCachedProtocolState(): {
    protocolState: unknown;
    isLoading: boolean;
    refetch: () => void;
} {
    const query = trpc.protocol.getStats.useQuery(undefined, {
        refetchInterval: PROTOCOL_REFRESH_INTERVAL,
        staleTime: 60 * 1000, // Consider fresh for 1 minute
    });

    return {
        protocolState: query.data,
        isLoading: query.isLoading,
        refetch: query.refetch,
    };
}

/**
 * Hook to get cached vault types from DB
 */
export function useCachedVaultTypes(): {
    vaultTypes: unknown;
    isLoading: boolean;
    refetch: () => void;
} {
    const query = trpc.vaults.getAll.useQuery(undefined, {
        refetchInterval: PROTOCOL_REFRESH_INTERVAL,
        staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes
    });

    return {
        vaultTypes: query.data,
        isLoading: query.isLoading,
        refetch: query.refetch,
    };
}

/**
 * Hook to get live analytics (uses cached DB data)
 */
export function useCachedAnalytics(): {
    analytics: unknown;
    isLoading: boolean;
    refetch: () => void;
} {
    const query = trpc.analytics.getLiveStats.useQuery(undefined, {
        refetchInterval: PROTOCOL_REFRESH_INTERVAL,
        staleTime: 60 * 1000,
    });

    return {
        analytics: query.data,
        isLoading: query.isLoading,
        refetch: query.refetch,
    };
}

/**
 * Hook for pre-transaction data refresh
 * Call this before any on-chain action to ensure fresh data
 * 
 * Note: Once backend is rebuilt, this will use the sync.preTransactionRefresh mutation
 * For now, it just invalidates the cache
 */
export function usePreTransactionRefresh(): {
    refresh: () => Promise<boolean>;
    isRefreshing: boolean;
} {
    const utils = trpc.useUtils();

    const refresh = useCallback(async () => {
        try {
            // Invalidate frontend cache to get fresh data
            await utils.protocol.getStats.invalidate();
            await utils.vaults.getAll.invalidate();
            return true;
        } catch (error) {
            console.error("Pre-transaction refresh failed:", error);
            return false;
        }
    }, [utils]);

    return {
        refresh,
        isRefreshing: false,
    };
}

/**
 * Hook to get position stats from DB
 */
export function useCachedPositionStats(): {
    stats: unknown;
    isLoading: boolean;
    refetch: () => void;
} {
    const query = trpc.positions.getStats.useQuery(undefined, {
        refetchInterval: PROTOCOL_REFRESH_INTERVAL,
        staleTime: 60 * 1000,
    });

    return {
        stats: query.data,
        isLoading: query.isLoading,
        refetch: query.refetch,
    };
}

/**
 * Hook to get risky positions
 */
export function useCachedRiskyPositions(threshold = 120): {
    riskyPositions: unknown;
    isLoading: boolean;
    refetch: () => void;
} {
    const query = trpc.positions.getRisky.useQuery({ threshold }, {
        refetchInterval: PROTOCOL_REFRESH_INTERVAL,
        staleTime: 60 * 1000,
    });

    return {
        riskyPositions: query.data,
        isLoading: query.isLoading,
        refetch: query.refetch,
    };
}
