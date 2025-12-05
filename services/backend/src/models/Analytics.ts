import mongoose from "mongoose";

const AnalyticsSchema = new mongoose.Schema({
    timestamp: { type: Number, required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD

    // Protocol Metrics
    tvlUsd: { type: Number, required: true },
    totalDebtUsd: { type: Number, required: true },
    totalPositions: { type: Number, required: true },
    activeVaults: { type: Number, required: true },

    // Risk Metrics
    avgLtv: { type: Number, required: true },
    riskyPositionsCount: { type: Number, required: true },

    // Revenue (cumulative)
    totalFeesCollected: { type: Number, default: 0 },
});

export const Analytics = mongoose.model("Analytics", AnalyticsSchema);
