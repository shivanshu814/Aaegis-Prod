/**
 * Protocol Types
 */

export interface BackendProtocolStateData {
    collateralRatioBps: string | number | bigint;
    liquidationThresholdBps: string | number | bigint;
    mintFeeBps: string | number | bigint;
    redeemFeeBps: string | number | bigint;
    stabilityFeeBps: string | number | bigint;
}

export interface FrontendProtocolStateAccount {
    collateralRatioBps: string | number | bigint;
    liquidationThresholdBps: string | number | bigint;
    mintFeeBps: string | number | bigint;
    redeemFeeBps: string | number | bigint;
    stabilityFeeBps: string | number | bigint;
}
