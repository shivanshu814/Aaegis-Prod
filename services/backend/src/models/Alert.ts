import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['LIQUIDATION', 'ORACLE_FAILURE', 'PROTOCOL_PAUSE', 'HEALTH_WARNING']
    },
    severity: {
        type: String,
        required: true,
        enum: ['INFO', 'WARNING', 'CRITICAL']
    },
    message: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Number, required: true },
    read: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Number },
});

AlertSchema.index({ timestamp: -1 });
AlertSchema.index({ type: 1, timestamp: -1 });
AlertSchema.index({ severity: 1, read: 1 });

export const Alert = mongoose.model("Alert", AlertSchema);

