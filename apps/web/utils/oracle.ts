/**
 * Oracle Utilities
 * Handles oracle price data and calculations
 */

import { BN } from "@coral-xyz/anchor";
import type {
    BackendOracleData,
    FrontendOraclePriceAccount as OraclePriceAccount,
} from "../types";

/**
 * Helper to convert BN/number/bigint/string to number
 */
function toNumber(value: BN | number | bigint | string): number {
    if (typeof value === "string") return Number(value);
    if (typeof value === "bigint") return Number(value);
    if (value instanceof BN) return value.toNumber();
    return value;
}

export function getSOLPriceUSD(
    oracle: OraclePriceAccount | BackendOracleData | null,
): number {
    if (!oracle) return 0;
    const price = toNumber(oracle.price);
    const decimals = oracle.priceDecimals || 8; // Default to 8 if not present
    return price / Math.pow(10, decimals);
}

/**
 * Check if oracle is stale
 */
export function isOracleStale(
    oracle: OraclePriceAccount | null,
    oracleTtlSeconds: number,
): boolean {
    if (!oracle) return true;

    const now = Math.floor(Date.now() / 1000);
    const oracleAge = now - Number(oracle.lastUpdated);
    return oracleAge > oracleTtlSeconds;
}

/**
 * Get oracle age in seconds
 */
export function getOracleAge(oracle: OraclePriceAccount | null): number {
    if (!oracle) return Infinity;

    const now = Math.floor(Date.now() / 1000);
    const lastUpdated = toNumber(oracle.lastUpdated);
    return now - lastUpdated;
}

/**
 * Format oracle age for display
 */
export function formatOracleAge(oracle: OraclePriceAccount | null): string {
    const age = getOracleAge(oracle);
    if (age === Infinity) return "Unknown";

    if (age < 60) return `${age}s`;
    if (age < 3600) return `${Math.floor(age / 60)}m`;
    if (age < 86400) return `${Math.floor(age / 3600)}h`;
    return `${Math.floor(age / 86400)}d`;
}
