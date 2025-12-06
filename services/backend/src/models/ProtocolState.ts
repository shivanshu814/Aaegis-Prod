import mongoose, { Document, Schema } from "mongoose";

export interface IProtocolState extends Document {
    adminPubkey: string;
    treasuryPubkey: string;
    stablecoinMint: string;
    totalProtocolDebt: number;
    globalDebtCeiling: number;

    // Fee tracking (cumulative)
    totalMintFeesCollected: number;
    totalRedeemFeesCollected: number;
    totalLiquidationFeesCollected: number;

    // Fee configuration (bps)
    baseMintFeeBps: number;
    baseRedeemFeeBps: number;
    baseLiquidationPenaltyBps: number;
    baseStabilityFeeBps: number;

    // Risk configuration (bps)
    baseCollateralRatioBps: number;
    baseLiquidationThresholdBps: number;

    updatedAt: number;
}

const ProtocolStateSchema: Schema = new Schema({
    adminPubkey: { type: String, required: true },
    treasuryPubkey: { type: String, required: true },
    stablecoinMint: { type: String, required: true },
    totalProtocolDebt: { type: Number, default: 0 },
    globalDebtCeiling: { type: Number, required: true },

    // Fee tracking
    totalMintFeesCollected: { type: Number, default: 0 },
    totalRedeemFeesCollected: { type: Number, default: 0 },
    totalLiquidationFeesCollected: { type: Number, default: 0 },

    // Fee configuration
    baseMintFeeBps: { type: Number, default: 0 },
    baseRedeemFeeBps: { type: Number, default: 0 },
    baseLiquidationPenaltyBps: { type: Number, default: 0 },
    baseStabilityFeeBps: { type: Number, default: 0 },

    // Risk configuration
    baseCollateralRatioBps: { type: Number, default: 0 },
    baseLiquidationThresholdBps: { type: Number, default: 0 },

    updatedAt: { type: Number, required: true },
});

export const ProtocolState = mongoose.model<IProtocolState>("ProtocolState", ProtocolStateSchema);
