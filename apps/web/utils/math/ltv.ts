/**
 * LTV (Loan to Value) Calculation Utilities
 * Handles all LTV-related calculations and risk assessments
 */

import type {
    BackendOracleData,
    BackendProtocolStateData,
} from "../../types";
import { calculateCollateralRatioFromAmounts } from "./collateral";

/**
 * Calculate max LTV percentage from collateral ratio BPS
 */
export function calculateMaxLTV(
    protocolState: BackendProtocolStateData | null
): number {
    const collateralRatioBps = protocolState
        ? Number(protocolState.collateralRatioBps)
        : 15000;
    return (10000 / collateralRatioBps) * 100;
}

/**
 * Calculate liquidation LTV percentage from liquidation threshold BPS
 */
export function calculateLiquidationLTV(
    protocolState: BackendProtocolStateData | null
): number {
    const liquidationThresholdBps = protocolState
        ? Number(protocolState.liquidationThresholdBps)
        : 13000;
    return (10000 / liquidationThresholdBps) * 100;
}

/**
 * Calculate health factor from collateral ratio and liquidation threshold
 */
export function calculateHealthFactor(
    totalCollateralSOL: number,
    totalDebtAGSUSD: number,
    oracle: BackendOracleData | null,
    protocolState: BackendProtocolStateData | null
): number {
    // If no debt, health factor is maximum (safe)
    if (totalDebtAGSUSD === 0 || totalDebtAGSUSD <= 0) {
        return 4.0;
    }

    // If no collateral or oracle, cannot calculate - return 0
    if (totalCollateralSOL === 0 || !oracle) {
        return 0;
    }

    const liquidationThresholdBps = protocolState
        ? Number(protocolState.liquidationThresholdBps)
        : 13000;

    // Convert BPS to percentage (13000 bps = 130) to match collateralRatio which is in %
    const liquidationThresholdPercent = liquidationThresholdBps / 100;

    const collateralRatio = calculateCollateralRatioFromAmounts(
        totalCollateralSOL,
        totalDebtAGSUSD,
        oracle
    );

    // If collateral ratio is Infinity or invalid, return 0
    if (collateralRatio === Infinity || !isFinite(collateralRatio) || collateralRatio <= 0) {
        return 0;
    }

    // Health factor = collateral ratio / liquidation threshold percentage
    // Example: 200% collateral ratio / 130% threshold = 1.54 health factor
    // Higher health factor = safer position
    const healthFactor = liquidationThresholdPercent > 0
        ? collateralRatio / liquidationThresholdPercent
        : 0;

    // Clamp between 0 and 4
    return Math.min(4, Math.max(0, healthFactor));
}

/**
 * Check if borrow is risky based on health factor
 */
export function calculateIsRiskyBorrow(
    totalCollateralSOL: number,
    totalDebtAGSUSD: number,
    oracle: BackendOracleData | null,
    protocolState: BackendProtocolStateData | null
): boolean {
    if (totalDebtAGSUSD <= 0) return false;
    const healthFactor = calculateHealthFactor(
        totalCollateralSOL,
        totalDebtAGSUSD,
        oracle,
        protocolState
    );
    return healthFactor < 1.75;
}

/**
 * LTV Risk Zone
 */
export interface LTVRiskZone {
    label: string;
    color: string;
    position: number;
}

/**
 * Get LTV risk zone based on current LTV and max LTV
 */
export function getLTVRiskZone(
    currentLTV: number,
    maxLTV: number
): LTVRiskZone {
    if (currentLTV < maxLTV * 0.5) {
        return { label: "Conservative", color: "bg-green-500", position: 0 };
    } else if (currentLTV < maxLTV * 0.75) {
        return { label: "Moderate", color: "bg-yellow-500", position: 25 };
    } else if (currentLTV < maxLTV * 0.95) {
        return { label: "Aggressive", color: "bg-orange-500", position: 50 };
    } else {
        return { label: "Liquidation", color: "bg-red-500", position: 100 };
    }
}

/**
 * Calculate borrow amount from LTV slider value
 */
export function calculateBorrowFromLTV(
    ltvValue: number,
    totalCollateralValueUSD: number,
    currentDebtAGSUSD: number,
    availableToBorrow: number
): number {
    if (totalCollateralValueUSD <= 0 || ltvValue <= 0) return 0;
    const targetDebtUSD = (ltvValue / 100) * totalCollateralValueUSD;
    const newBorrowAGSUSD = Math.max(0, targetDebtUSD - currentDebtAGSUSD);
    return Math.min(newBorrowAGSUSD, availableToBorrow);
}

/**
 * Calculate liquidation price for SOL from protocol state
 */
export function calculateLiquidationPriceFromState(
    collateralSOL: number,
    debtAGSUSD: number,
    protocolState: BackendProtocolStateData | null,
): number {
    if (collateralSOL === 0 || debtAGSUSD === 0 || !protocolState) return 0;
    const liquidationThresholdBps = Number(protocolState.liquidationThresholdBps) || 13000;
    const thresholdRatio = liquidationThresholdBps / 10000;
    return (debtAGSUSD * thresholdRatio) / collateralSOL;
}

/**
 * Get health factor angle for visualization (0-180 degrees)
 */
export function getHealthFactorAngle(healthFactor: number): number {
    const normalized = Math.min(4, Math.max(0, healthFactor));
    if (normalized === 0) return 180;
    if (normalized >= 4) return 0;
    return 180 - (normalized / 4) * 180;
}

/**
 * Get health factor background color
 */
export function getHealthFactorColor(healthFactor: number): string {
    if (healthFactor >= 2.5) return "#10b981";
    if (healthFactor >= 1.75) return "#f97316";
    if (healthFactor > 0) return "#ef4444";
    return "rgba(255, 255, 255, 0.1)";
}

/**
 * Get health factor risk label and color
 */
export function getHealthFactorRisk(healthFactor: number): {
    label: string;
    color: string;
} {
    if (healthFactor >= 2.5) {
        return { label: "Safe", color: "bg-green-500/20 text-green-400" };
    }
    if (healthFactor >= 1.75) {
        return { label: "Moderate Risk", color: "bg-orange-500/20 text-orange-400" };
    }
    if (healthFactor > 0) {
        return { label: "High Risk", color: "bg-red-500/20 text-red-400" };
    }
    return { label: "No Debt", color: "bg-white/10 text-white/60" };
}
