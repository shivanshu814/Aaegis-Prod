/**
 * Collateral Calculation Utilities
 * Handles all collateral-related calculations
 */

import { BN } from "@coral-xyz/anchor";
import type {
    BackendOracleData,
    BackendProtocolStateData,
    FrontendOraclePriceAccount,
    FrontendProtocolStateAccount,
} from "../../types";

type OraclePriceAccount = FrontendOraclePriceAccount | BackendOracleData;
type ProtocolStateAccount = FrontendProtocolStateAccount | BackendProtocolStateData;

/**
 * Helper to convert BN/number/bigint/string to number
 */
function toNumber(value: BN | number | bigint | string): number {
    if (typeof value === "string") return Number(value);
    if (typeof value === "bigint") return Number(value);
    if (value instanceof BN) return value.toNumber();
    return value;
}

/**
 * Calculate collateral value in USD from SOL amount
 */
export function calculateCollateralValueUSD(
    solAmount: number,
    oracle: OraclePriceAccount | null,
): number {
    if (!oracle) return 0;
    const price = toNumber(oracle.price);
    const decimals = oracle.priceDecimals || 8;
    const solPriceUSD = price / Math.pow(10, decimals);
    return solAmount * solPriceUSD;
}

/**
 * Calculate max borrowable amount in USD based on collateral
 * Formula: max_borrow = collateral_value * 10000 / collateral_ratio_bps
 */
export function calculateMaxBorrowUSD(
    collateralValueUSD: number,
    collateralRatioBps: BN | number | bigint | string,
): number {
    const ratio = toNumber(collateralRatioBps);
    if (ratio === 0) return 0;
    return (collateralValueUSD * 10000) / ratio;
}

/**
 * Calculate max borrowable AGSUSD from SOL collateral
 */
export function calculateMaxBorrowableAGSUSD(
    solAmount: number,
    oracle: OraclePriceAccount | null,
    protocolState: ProtocolStateAccount | null,
): number {
    if (!oracle || !protocolState) return 0;

    const collateralValueUSD = calculateCollateralValueUSD(solAmount, oracle);
    const collateralRatioBps =
        toNumber(protocolState.collateralRatioBps) || 15000;
    const maxBorrowUSD = calculateMaxBorrowUSD(
        collateralValueUSD,
        collateralRatioBps,
    );

    // Apply 95% safety margin to avoid on-chain rejection
    return maxBorrowUSD * 0.95;
}

/**
 * Calculate required SOL amount for desired AGSUSD amount
 */
export function calculateRequiredSOL(
    agsAmount: number,
    oracle: OraclePriceAccount | null,
    protocolState: ProtocolStateAccount | null,
): number {
    if (!oracle || !protocolState) return 0;

    const price = toNumber(oracle.price);
    const solPriceUSD = price / Math.pow(10, oracle.priceDecimals);
    const collateralRatioBps =
        toNumber(protocolState.collateralRatioBps) || 15000;

    // Reverse calculation: ags = (sol * price * 10000 / ratio) * 0.95
    // sol = (ags / 0.95) * ratio / (price * 10000)
    const requiredSolValue = (agsAmount / 0.95) * (collateralRatioBps / 10000);
    return requiredSolValue / solPriceUSD;
}

/**
 * Calculate collateral ratio percentage
 */
export function calculateCollateralRatio(
    collateralValueUSD: number,
    debtAmountUSD: number,
): number {
    if (debtAmountUSD === 0) return Infinity;
    return (collateralValueUSD / debtAmountUSD) * 100;
}

/**
 * Calculate collateral ratio from SOL and AGSUSD amounts
 */
export function calculateCollateralRatioFromAmounts(
    solAmount: number,
    agsAmount: number,
    oracle: OraclePriceAccount | null,
): number {
    if (agsAmount === 0 || !oracle) return Infinity;

    const price = toNumber(oracle.price);
    const solPriceUSD = price / Math.pow(10, oracle.priceDecimals);
    const collateralValueUSD = solAmount * solPriceUSD;
    return calculateCollateralRatio(collateralValueUSD, agsAmount);
}

/**
 * Calculate new collateral ratio after withdrawal/redeem
 */
export function calculateNewCollateralRatio(
    currentCollateralSOL: number,
    currentDebtAGSUSD: number,
    withdrawSOL: number,
    redeemAGSUSD: number,
    oracle: OraclePriceAccount | null,
): number {
    if (!oracle) return 0;

    const remainingDebt = currentDebtAGSUSD - redeemAGSUSD;
    if (remainingDebt === 0) return Infinity;

    const remainingCollateral = currentCollateralSOL - withdrawSOL;
    const price = toNumber(oracle.price);
    const solPriceUSD = price / Math.pow(10, oracle.priceDecimals);
    const collateralValueUSD = remainingCollateral * solPriceUSD;

    return calculateCollateralRatio(collateralValueUSD, remainingDebt);
}

/**
 * Calculate SOL amount from AGS amount based on vault's current debt/collateral ratio
 * Used for redeem operations where we need to maintain the vault's current ratio
 */
export function calculateSolFromAgsForRedeem(
    agsAmount: number,
    vaultDebt: number,
    vaultCollateral: number,
): number {
    if (vaultDebt === 0) return 0;
    const solPerAgs = vaultCollateral / vaultDebt;
    return agsAmount * solPerAgs;
}

/**
 * Calculate AGS amount from SOL amount based on vault's current debt/collateral ratio
 * Used for redeem operations where we need to maintain the vault's current ratio
 */
export function calculateAgsFromSolForRedeem(
    solAmount: number,
    vaultDebt: number,
    vaultCollateral: number,
): number {
    if (vaultCollateral === 0) return 0;
    const agsPerSol = vaultDebt / vaultCollateral;
    return solAmount * agsPerSol;
}

/**
 * Calculate liquidation price for SOL
 * Liquidation occurs when: collateral_value / debt = liquidation_threshold_ratio
 * So: liquidation_price = (debt * liquidation_threshold_ratio) / collateral_amount
 */
export function calculateLiquidationPrice(
    collateralSOL: number,
    debtAGSUSD: number,
    liquidationThresholdBps: BN | number | bigint | string,
): number {
    if (collateralSOL === 0 || debtAGSUSD === 0) return 0;
    const thresholdRatio = toNumber(liquidationThresholdBps) / 10000;
    // liquidation_price = (debt * threshold_ratio) / collateral
    return (debtAGSUSD * thresholdRatio) / collateralSOL;
}

/**
 * Calculate Loan to Value (LTV) ratio
 * LTV = (Debt / Collateral Value) * 100
 */
export function calculateLTV(
    debtAmountUSD: number,
    collateralValueUSD: number,
): number {
    if (collateralValueUSD === 0) return 0;
    return (debtAmountUSD / collateralValueUSD) * 100;
}

/**
 * Calculate LTV from SOL and AGSUSD amounts
 */
export function calculateLTVFromAmounts(
    solAmount: number,
    agsAmount: number,
    oracle: OraclePriceAccount | null,
): number {
    if (solAmount === 0 || !oracle) return 0;
    const collateralValueUSD = calculateCollateralValueUSD(solAmount, oracle);
    return calculateLTV(agsAmount, collateralValueUSD);
}
