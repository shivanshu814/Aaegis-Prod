/**
 * Borrow Calculation Utilities
 * Handles all borrow-related calculations
 */

import type {
    BackendOracleData,
    BackendProtocolStateData,
} from "../../types";
import { calculateMaxBorrowableAGSUSD } from "./collateral";
import { calculateTotalCollateralSOL } from "./deposit";

/**
 * Calculate total debt AGSUSD after borrow
 */
export function calculateTotalDebtAGSUSD(
    currentDebtAGSUSD: number,
    borrowAmountAGSUSD: number,
): number {
    return currentDebtAGSUSD + borrowAmountAGSUSD;
}

/**
 * Calculate available amount to borrow
 * Returns max borrowable minus current debt
 */
export function calculateAvailableToBorrow(
    totalCollateralSOL: number,
    currentDebtAGSUSD: number,
    oracle: BackendOracleData | null,
    protocolState: BackendProtocolStateData | null,
): number {
    const maxBorrow = calculateMaxBorrowableAGSUSD(
        totalCollateralSOL,
        oracle,
        protocolState,
    );
    return Math.max(0, maxBorrow - currentDebtAGSUSD);
}

/**
 * Calculate new borrow amount available after depositing SOL
 * Auto-suggests borrow amount based on new collateral
 */
export function calculateNewBorrowAfterDeposit(
    currentCollateralSOL: number,
    depositAmountSOL: number,
    currentDebtAGSUSD: number,
    oracle: BackendOracleData | null,
    protocolState: BackendProtocolStateData | null,
): number {
    const totalCollateralSOL = calculateTotalCollateralSOL(
        currentCollateralSOL,
        depositAmountSOL,
    );
    return calculateAvailableToBorrow(
        totalCollateralSOL,
        currentDebtAGSUSD,
        oracle,
        protocolState,
    );
}

/**
 * Calculate USD value of AGSUSD borrow amount
 */
export function calculateBorrowUSDValue(agsAmount: number): number {
    return agsAmount; // AGSUSD is already in USD terms
}
