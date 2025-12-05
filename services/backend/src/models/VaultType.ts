import mongoose, { Document, Schema } from "mongoose";

export interface IVaultType extends Document {
    collateralMint: string;
    oraclePriceAccount: string;
    ltvBps: number;
    liqThresholdBps: number;
    liqPenaltyBps: number;
    stabilityFeeBps: number;
    mintFeeBps: number;
    redeemFeeBps: number;
    vaultDebtCeiling: number;
    isActive: boolean;
    totalCollateral: number;
    totalDebt: number;
}

const VaultTypeSchema: Schema = new Schema({
    collateralMint: { type: String, required: true, unique: true },
    oraclePriceAccount: { type: String, required: true },
    ltvBps: { type: Number, required: true },
    liqThresholdBps: { type: Number, required: true },
    liqPenaltyBps: { type: Number, required: true },
    stabilityFeeBps: { type: Number, required: true },
    mintFeeBps: { type: Number, required: true },
    redeemFeeBps: { type: Number, required: true },
    vaultDebtCeiling: { type: Number, required: true },
    isActive: { type: Boolean, required: true, default: true },
    totalCollateral: { type: Number, default: 0 },
    totalDebt: { type: Number, default: 0 },
});

export const VaultType = mongoose.model<IVaultType>("VaultType", VaultTypeSchema);
