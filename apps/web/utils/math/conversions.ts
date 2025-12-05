/**
 * Unit Conversion Utilities
 * Handles conversions between different units (lamports, SOL, AGSUSD, etc.)
 */

/**
 * Convert lamports to SOL
 */
export function lamportsToSOL(lamports: number | string | bigint): number {
    const lamportsNum =
        typeof lamports === "bigint" ? Number(lamports) : Number(lamports);
    return lamportsNum / 1e9;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
    return Math.floor(sol * 1e9);
}

/**
 * Convert AGSUSD units (6 decimals) to AGSUSD amount
 */
export function unitsToAGSUSD(units: number | string | bigint): number {
    const unitsNum = typeof units === "bigint" ? Number(units) : Number(units);
    return unitsNum / 1e6;
}

/**
 * Convert AGSUSD amount to units (6 decimals)
 */
export function agsUSDToUnits(agsUSD: number): number {
    return Math.floor(agsUSD * 1e6);
}

/**
 * Format number with decimals
 */
export function formatNumber(value: number, decimals: number = 2): string {
    return value.toFixed(decimals);
}

/**
 * Format SOL amount
 */
export function formatSOL(sol: number, decimals: number = 4): string {
    return formatNumber(sol, decimals);
}

/**
 * Format AGSUSD amount
 */
export function formatAGSUSD(agsUSD: number, decimals: number = 2): string {
    return formatNumber(agsUSD, decimals);
}

/**
 * Format USD amount
 */
export function formatUSD(usd: number, decimals: number = 2): string {
    return `$${formatNumber(usd, decimals)}`;
}
