/**
 * Vault Types
 */

export interface BackendVaultData {
    owner: string;
    collateralAmount: string | number | bigint;
    debtAmount: string | number | bigint;
    createdAt: string | number | bigint;
}
