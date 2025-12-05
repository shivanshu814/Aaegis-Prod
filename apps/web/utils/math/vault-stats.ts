/**
 * Vault Statistics Calculation Utilities
 * Handles calculations for vault statistics and aggregations
 */

import { BN } from "@coral-xyz/anchor";
import type { FrontendOraclePriceAccount as OraclePriceAccount } from "../../types";
import { calculateCollateralRatioFromAmounts } from "./collateral";

/**
 * Helper to convert BN/number/bigint/string to number
 */
function toNumber(value: BN | number | bigint | string): number {
    if (typeof value === "string") return Number(value);
    if (typeof value === "bigint") return Number(value);
    if (value instanceof BN) return value.toNumber();
    return value;
}

export interface VaultStats {
    totalCollateral: number;
    totalDebt: number;
    avgCollateralRatio: number;
}

export interface ProcessedVault {
    id: string;
    collateral: number;
    debt: number;
    collateralRatio: number;
    status: "healthy" | "warning" | "danger";
    created: string;
}

/**
 * Determine vault status based on collateral ratio
 */
export function getVaultStatus(
    collateralRatio: number,
    minCollateralRatio: number = 150,
): "healthy" | "warning" | "danger" {
    if (collateralRatio >= 200) {
        return "healthy";
    } else if (collateralRatio >= minCollateralRatio) {
        return "warning";
    } else {
        return "danger";
    }
}

/**
 * Calculate total collateral from vaults array
 */
export function calculateTotalCollateral(vaults: ProcessedVault[]): number {
    return vaults.reduce((sum, v) => sum + v.collateral, 0);
}

/**
 * Calculate total debt from vaults array
 */
export function calculateTotalDebt(vaults: ProcessedVault[]): number {
    return vaults.reduce((sum, v) => sum + v.debt, 0);
}

/**
 * Calculate average collateral ratio from vaults array
 */
export function calculateAvgCollateralRatio(vaults: ProcessedVault[]): number {
    if (vaults.length === 0) return 0;
    return vaults.reduce((sum, v) => sum + v.collateralRatio, 0) / vaults.length;
}

/**
 * Calculate all vault statistics
 */
export function calculateVaultStats(vaults: ProcessedVault[]): VaultStats {
    return {
        totalCollateral: calculateTotalCollateral(vaults),
        totalDebt: calculateTotalDebt(vaults),
        avgCollateralRatio: calculateAvgCollateralRatio(vaults),
    };
}

/**
 * Process raw vault data into formatted vault object
 */
export function processVaultData(
    vault: {
        collateralAmount: BN | number | bigint | string;
        debtAmount: BN | number | bigint | string;
        createdAt: BN | number | bigint | string;
    },
    walletPubkey: string | null,
    oracle: OraclePriceAccount | null,
    minCollateralRatio: number = 150,
): ProcessedVault {
    const collateral = toNumber(vault.collateralAmount) / 1e9;
    const debt = toNumber(vault.debtAmount) / 1e6;
    const collateralRatio = calculateCollateralRatioFromAmounts(
        collateral,
        debt,
        oracle,
    );
    const status = getVaultStatus(collateralRatio, minCollateralRatio);

    return {
        id: walletPubkey?.toString().slice(0, 8) || "unknown",
        collateral,
        debt,
        collateralRatio,
        status,
        created: new Date(toNumber(vault.createdAt) * 1000).toLocaleDateString(),
    };
}
