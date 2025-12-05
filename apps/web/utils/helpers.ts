/**
 * General Helper Utilities
 * Common helper functions used across the app
 */

/**
 * Get collateral ratio color class based on ratio value
 */
export function getCollateralRatioColor(ratio: number | string): string {
    if (ratio === "∞" || ratio === Infinity || ratio === "N/A") {
        return "text-green-400";
    }

    const numRatio = typeof ratio === "string" ? parseFloat(ratio) : ratio;

    if (isNaN(numRatio)) return "text-gray-400";
    if (numRatio >= 200) return "text-green-400";
    if (numRatio >= 150) return "text-yellow-400";
    return "text-red-400";
}

/**
 * Get status color class based on status
 */
export function getStatusColor(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === "healthy" || statusLower === "active") {
        return "text-green-400";
    }
    if (statusLower === "warning" || statusLower === "at_risk") {
        return "text-yellow-400";
    }
    if (statusLower === "liquidated" || statusLower === "inactive") {
        return "text-red-400";
    }
    return "text-gray-400";
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await sleep(delay);
        return retry(fn, retries - 1, delay * 2);
    }
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        return false;
    }
}

/**
 * Open Solana explorer for transaction
 */
export function openSolanaExplorer(
    signature: string,
    cluster: "mainnet" | "devnet" | "localnet" = "devnet"
): void {
    const baseUrl =
        cluster === "mainnet"
            ? "https://solscan.io/tx/"
            : cluster === "devnet"
                ? "https://solscan.io/tx/"
                : `http://localhost:3000/tx/`;

    const url = `${baseUrl}${signature}${cluster === "devnet" ? "?cluster=devnet" : ""}`;
    window.open(url, "_blank");
}

/**
 * Open Solana explorer for address
 */
export function openSolanaExplorerAddress(
    address: string,
    cluster: "mainnet" | "devnet" | "localnet" = "devnet"
): void {
    const baseUrl =
        cluster === "mainnet"
            ? "https://solscan.io/account/"
            : cluster === "devnet"
                ? "https://solscan.io/account/"
                : `http://localhost:3000/account/`;

    const url = `${baseUrl}${address}${cluster === "devnet" ? "?cluster=devnet" : ""}`;
    window.open(url, "_blank");
}

/**
 * Determine which percentage button is selected based on current amount
 * @param currentAmount - Current amount as string
 * @param walletBalance - Total wallet balance
 * @param feeReserve - Amount to reserve for fees (default 0.01 SOL)
 * @param tolerance - Tolerance for floating point comparison (default 0.001)
 * @returns Selected percentage (25, 50, 75), "max", or null
 */
export function getSelectedPercentage(
    currentAmount: string,
    walletBalance: number,
    feeReserve: number = 0.01,
    tolerance: number = 0.001
): 25 | 50 | 75 | "max" | null {
    if (!currentAmount || walletBalance <= 0) return null;

    const amount = parseFloat(currentAmount);
    if (amount <= 0) return null;

    const maxAmount = Math.max(0, walletBalance - feeReserve);

    // Check if Max is selected (within tolerance)
    if (Math.abs(amount - maxAmount) < tolerance) {
        return "max";
    }

    // Check percentages
    const percentages: (25 | 50 | 75)[] = [25, 50, 75];
    for (const pct of percentages) {
        const expectedAmount = (walletBalance * pct) / 100;
        if (Math.abs(amount - expectedAmount) < tolerance) {
            return pct;
        }
    }

    return null;
}
