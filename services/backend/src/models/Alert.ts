import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['LIQUIDATION', 'ORACLE_FAILURE', 'PROTOCOL_PAUSE'] },
    severity: { type: String, required: true, enum: ['INFO', 'WARNING', 'CRITICAL'] },
    message: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed }, // Store JSON details
    timestamp: { type: Number, required: true },
    read: { type: Boolean, default: false },
});

export const Alert = mongoose.model("Alert", AlertSchema);
