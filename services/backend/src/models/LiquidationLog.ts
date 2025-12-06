import mongoose, { Document, Schema } from "mongoose";

export interface ILiquidationLog extends Document {
    liquidatorPubkey: string;
    positionOwner: string;
    positionPubkey: string;
    vaultType: string;

    // Amounts
    debtRepaid: number;      // Stablecoin amount repaid (6 decimals)
    collateralSeized: number; // Collateral amount seized (9 decimals for SOL)
    penaltyFee: number;       // Penalty fee collected by protocol (6 decimals)

    // Prices at liquidation
    collateralPrice: number;  // USD price of collateral

    // Transaction details
    txSignature: string;
    timestamp: number;

    // Health factor at the time of liquidation
    healthFactorBefore: number;
}

const LiquidationLogSchema: Schema = new Schema({
    liquidatorPubkey: { type: String, required: true, index: true },
    positionOwner: { type: String, required: true, index: true },
    positionPubkey: { type: String, required: true },
    vaultType: { type: String, required: true, index: true },

    debtRepaid: { type: Number, required: true },
    collateralSeized: { type: Number, required: true },
    penaltyFee: { type: Number, required: true },

    collateralPrice: { type: Number, required: true },

    txSignature: { type: String, required: true, unique: true },
    timestamp: { type: Number, required: true, index: true },

    healthFactorBefore: { type: Number, required: true },
});

// Index for time-based queries
LiquidationLogSchema.index({ timestamp: -1 });

export const LiquidationLog = mongoose.model<ILiquidationLog>("LiquidationLog", LiquidationLogSchema);
