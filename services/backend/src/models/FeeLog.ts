import mongoose, { Document, Schema } from "mongoose";

export interface IFeeLog extends Document {
    type: 'mint' | 'redeem' | 'stability' | 'liquidation';
    amount: number; // Fee amount in USD (6 decimals)
    txSignature: string;
    userPubkey: string;
    vaultType: string;
    timestamp: number;
    relatedPositionPubkey?: string;
}

const FeeLogSchema: Schema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ['mint', 'redeem', 'stability', 'liquidation'],
        index: true
    },
    amount: { type: Number, required: true },
    txSignature: { type: String, required: true, unique: true },
    userPubkey: { type: String, required: true, index: true },
    vaultType: { type: String, required: true, index: true },
    timestamp: { type: Number, required: true, index: true },
    relatedPositionPubkey: { type: String, required: false },
});

// Index for time-based queries
FeeLogSchema.index({ timestamp: -1 });

export const FeeLog = mongoose.model<IFeeLog>("FeeLog", FeeLogSchema);
