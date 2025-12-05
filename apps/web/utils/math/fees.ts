/**
 * Fee Calculation Utilities
 * Handles all fee-related calculations
 */

import { BN } from "@coral-xyz/anchor";
import type {
    BackendProtocolStateData,
    FrontendProtocolStateAccount as ProtocolStateAccount,
} from "../../types";

/**
 * Helper to convert BN/number/bigint/string to number
 */
function toNumber(value: BN | number | bigint | string | undefined): number {
    if (value === undefined) return 0;
    if (typeof value === "string") return Number(value);
    if (typeof value === "bigint") return Number(value);
    if (value instanceof BN) return value.toNumber();
    return value;
}

/**
 * Calculate mint fee in AGSUSD
 */
export function calculateMintFee(
    amountAGSUSD: number,
    protocolState: ProtocolStateAccount | null,
): number {
    if (!protocolState) return 0;
    const mintFeeBps = toNumber(protocolState.mintFeeBps) || 0;
    return amountAGSUSD * (mintFeeBps / 10000);
}

/**
 * Calculate redeem fee in AGSUSD
 */
export function calculateRedeemFee(
    amountAGSUSD: number,
    protocolState: ProtocolStateAccount | null,
): number {
    if (!protocolState) return 0;
    const redeemFeeBps = toNumber(protocolState.redeemFeeBps) || 0;
    return amountAGSUSD * (redeemFeeBps / 10000);
}

/**
 * Calculate net amount after mint fee
 */
export function calculateNetMintAmount(
    amountAGSUSD: number,
    protocolState: ProtocolStateAccount | null,
): number {
    const fee = calculateMintFee(amountAGSUSD, protocolState);
    return amountAGSUSD - fee;
}

/**
 * Calculate net amount after redeem fee
 */
export function calculateNetRedeemAmount(
    amountAGSUSD: number,
    protocolState: ProtocolStateAccount | null,
): number {
    const fee = calculateRedeemFee(amountAGSUSD, protocolState);
    return amountAGSUSD - fee;
}

/**
 * Calculate borrow rate percentage from stability fee BPS
 */
export function calculateBorrowRatePercent(
    protocolState: BackendProtocolStateData | ProtocolStateAccount | null,
): number {
    if (!protocolState) return 3.0; // Default 3%
    const stabilityFeeBps =
        "stabilityFeeBps" in protocolState
            ? Number(protocolState.stabilityFeeBps)
            : (protocolState as ProtocolStateAccount).stabilityFeeBps
                ? toNumber((protocolState as ProtocolStateAccount).stabilityFeeBps)
                : 300;
    return stabilityFeeBps / 100;
}
