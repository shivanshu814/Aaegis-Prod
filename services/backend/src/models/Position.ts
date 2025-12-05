import mongoose, { Document, Schema } from "mongoose";

export interface IPosition extends Document {
    owner: string;
    vaultType: string;
    collateralAmount: number;
    debtAmount: number;
    updatedAt: number;
    healthFactor: number;
}

const PositionSchema: Schema = new Schema({
    owner: { type: String, required: true, index: true },
    vaultType: { type: String, required: true, index: true },
    collateralAmount: { type: Number, required: true, default: 0 },
    debtAmount: { type: Number, required: true, default: 0 },
    updatedAt: { type: Number, required: true },
    healthFactor: { type: Number, required: true, default: 0 },
});

// Composite index for unique position per owner per vault type
PositionSchema.index({ owner: 1, vaultType: 1 }, { unique: true });

export const Position = mongoose.model<IPosition>("Position", PositionSchema);
