/**
 * Validation Utilities
 * Handles input validation and checks
 */

/**
 * Validate SOL amount
 */
export function validateSOLAmount(amount: number | string): {
    valid: boolean;
    error?: string;
} {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;

    if (isNaN(num) || num <= 0) {
        return { valid: false, error: "Amount must be greater than 0" };
    }

    if (num > 1e9) {
        return { valid: false, error: "Amount too large" };
    }

    return { valid: true };
}

/**
 * Validate AGSUSD amount
 */
export function validateAGSUSDAmount(amount: number | string): {
    valid: boolean;
    error?: string;
} {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;

    if (isNaN(num) || num <= 0) {
        return { valid: false, error: "Amount must be greater than 0" };
    }

    if (num > 1e12) {
        return { valid: false, error: "Amount too large" };
    }

    return { valid: true };
}

/**
 * Validate collateral ratio
 */
export function validateCollateralRatio(
    ratio: number,
    minRatio: number = 150,
): {
    valid: boolean;
    error?: string;
} {
    if (ratio === Infinity) {
        return { valid: true };
    }

    if (isNaN(ratio) || ratio < minRatio) {
        return {
            valid: false,
            error: `Collateral ratio must be at least ${minRatio}%`,
        };
    }

    return { valid: true };
}

/**
 * Validate public key format
 */
export function validatePublicKey(pubkey: string | null | undefined): {
    valid: boolean;
    error?: string;
} {
    if (!pubkey) {
        return { valid: false, error: "Public key is required" };
    }

    // Basic Solana public key format check (base58, 32-44 chars)
    if (pubkey.length < 32 || pubkey.length > 44) {
        return { valid: false, error: "Invalid public key format" };
    }

    return { valid: true };
}
