/**
 * Formatting Utilities
 * Handles display formatting for various data types
 */

/**
 * Format public key for display (first 4 + last 4 chars)
 */
export function formatPublicKey(pubkey: string | null | undefined): string {
    if (!pubkey) return "N/A";
    if (pubkey.length <= 8) return pubkey;
    return `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`;
}

/**
 * Format public key for display (first 8 + last 8 chars)
 */
export function formatPublicKeyLong(pubkey: string | null | undefined): string {
    if (!pubkey) return "N/A";
    if (pubkey.length <= 16) return pubkey;
    return `${pubkey.slice(0, 8)}...${pubkey.slice(-8)}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
    if (value === Infinity) return "∞";
    if (isNaN(value)) return "N/A";
    return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatLargeNumber(value: number, decimals: number = 2): string {
    if (value >= 1e9) return `${(value / 1e9).toFixed(decimals)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(decimals)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(decimals)}K`;
    return value.toFixed(decimals);
}

/**
 * Format transaction signature for display
 */
export function formatTransactionSignature(signature: string): string {
    if (!signature) return "N/A";
    if (signature.length <= 16) return signature;
    return `${signature.slice(0, 8)}...${signature.slice(-8)}`;
}

/**
 * Format date/time
 */
export function formatDateTime(timestamp: number | Date): string {
    const date =
        typeof timestamp === "number" ? new Date(timestamp * 1000) : timestamp;
    return date.toLocaleString();
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(timestamp: number): string {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}
