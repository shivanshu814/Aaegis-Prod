/**
 * Oracle Types
 */

export interface BackendOracleData {
    price: string | number | bigint;
    priceDecimals: number;
    lastUpdated: string | number | bigint;
}

export interface FrontendOraclePriceAccount {
    price: string | number | bigint;
    priceDecimals: number;
    lastUpdated: string | number | bigint;
}
