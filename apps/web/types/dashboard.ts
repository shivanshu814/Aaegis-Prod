import { PublicKey } from "@solana/web3.js";

export interface ProtocolStats {
    tvl: number;
    totalDebt: number;
    debtCeiling: number;
    isPaused: boolean;
}

export interface VaultTypeData {
    publicKey: PublicKey;
    collateralMint: PublicKey;
    ltv: number;
    stabilityFee: number;
    minCollateralRatio: number;
    debtCeiling: number;
    isActive: boolean;
    price: number | null;
}
