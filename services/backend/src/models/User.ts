import mongoose from "mongoose";

export interface IUser {
    walletAddress: string;
    email?: string;
    isSubscribed: boolean;
    subscribedAt?: Date;
    emailVerified: boolean;
    // Notification preferences
    notifications: {
        protocolHealth: boolean;
        liquidationWarning: boolean;
        positionUpdates: boolean;
        weeklyDigest: boolean;
        marketAlerts: boolean;
    };
    // User stats
    firstConnectedAt: Date;
    lastConnectedAt: Date;
    totalConnections: number;
    // Position tracking
    hasPosition: boolean;
    lastPositionCheck?: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        sparse: true,
        index: true
    },
    isSubscribed: {
        type: Boolean,
        default: false
    },
    subscribedAt: {
        type: Date
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    notifications: {
        protocolHealth: { type: Boolean, default: true },
        liquidationWarning: { type: Boolean, default: true },
        positionUpdates: { type: Boolean, default: true },
        weeklyDigest: { type: Boolean, default: false },
        marketAlerts: { type: Boolean, default: false },
    },
    firstConnectedAt: {
        type: Date,
        default: Date.now
    },
    lastConnectedAt: {
        type: Date,
        default: Date.now
    },
    totalConnections: {
        type: Number,
        default: 1
    },
    hasPosition: {
        type: Boolean,
        default: false
    },
    lastPositionCheck: {
        type: Date
    },
}, {
    timestamps: true,
});

// Indexes for efficient queries
UserSchema.index({ isSubscribed: 1, email: 1 });
UserSchema.index({ "notifications.liquidationWarning": 1 });
UserSchema.index({ hasPosition: 1 });

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
