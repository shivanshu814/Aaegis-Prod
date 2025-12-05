/**
 * Deposit/Withdrawal Calculation Utilities
 * Handles all deposit and withdrawal related calculations
 */

import type { BackendOracleData, BackendVaultData } from "../../types";
import { getSOLPriceUSD } from "../oracle";
import { lamportsToSOL, unitsToAGSUSD } from "./conversions";

/**
 * Extract current collateral SOL amount from vault
 */
export function getVaultCollateralSOL(vault: BackendVaultData | null): number {
    if (!vault) return 0;
    return lamportsToSOL(vault.collateralAmount);
}

/**
 * Extract current debt AGSUSD amount from vault
 */
export function getVaultDebtAGSUSD(vault: BackendVaultData | null): number {
    if (!vault) return 0;
    return unitsToAGSUSD(vault.debtAmount);
}

/**
 * Calculate total collateral SOL after deposit
 */
export function calculateTotalCollateralSOL(
    currentCollateralSOL: number,
    depositAmountSOL: number
): number {
    return currentCollateralSOL + depositAmountSOL;
}

/**
 * Calculate USD value of SOL deposit amount
 */
export function calculateDepositUSDValue(
    solAmount: number,
    oracle: BackendOracleData | null
): number {
    if (!solAmount || solAmount <= 0) return 0;
    const solPriceUSD = getSOLPriceUSD(oracle);
    return solAmount * solPriceUSD;
}
