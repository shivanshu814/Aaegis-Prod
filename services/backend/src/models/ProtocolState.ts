import mongoose, { Document, Schema } from "mongoose";

export interface IProtocolState extends Document {
    adminPubkey: string;
    treasuryPubkey: string;
    stablecoinMint: string;
    totalProtocolDebt: number;
    globalDebtCeiling: number;
    updatedAt: number;
}

const ProtocolStateSchema: Schema = new Schema({
    adminPubkey: { type: String, required: true },
    treasuryPubkey: { type: String, required: true },
    stablecoinMint: { type: String, required: true },
    totalProtocolDebt: { type: Number, default: 0 },
    globalDebtCeiling: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
});

export const ProtocolState = mongoose.model<IProtocolState>("ProtocolState", ProtocolStateSchema);
