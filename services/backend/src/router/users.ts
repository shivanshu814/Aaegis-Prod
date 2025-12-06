import { z } from "zod";
import { Position } from "../models/Position";
import { User } from "../models/User";
import { publicProcedure, router } from "../trpc";
import { emailService } from "../utils/email";

export const usersRouter = router({
    // Track wallet connection (called when user connects wallet)
    trackConnection: publicProcedure
        .input(z.object({
            walletAddress: z.string().min(32).max(50),
        }))
        .mutation(async ({ input }) => {
            const { walletAddress } = input;

            // Find or create user
            let user = await User.findOne({ walletAddress });

            if (user) {
                // Update existing user
                user.lastConnectedAt = new Date();
                user.totalConnections += 1;
                await user.save();

                return {
                    isNew: false,
                    needsEmail: !user.email || !user.isSubscribed,
                    user: {
                        walletAddress: user.walletAddress,
                        email: user.email,
                        isSubscribed: user.isSubscribed,
                        notifications: user.notifications,
                    },
                };
            }

            // Create new user
            user = await User.create({
                walletAddress,
                firstConnectedAt: new Date(),
                lastConnectedAt: new Date(),
                totalConnections: 1,
            });

            return {
                isNew: true,
                needsEmail: true,
                user: {
                    walletAddress: user.walletAddress,
                    email: null,
                    isSubscribed: false,
                    notifications: user.notifications,
                },
            };
        }),

    // Subscribe email
    subscribeEmail: publicProcedure
        .input(z.object({
            walletAddress: z.string(),
            email: z.string().email(),
            notifications: z.object({
                protocolHealth: z.boolean().optional(),
                liquidationWarning: z.boolean().optional(),
                positionUpdates: z.boolean().optional(),
                weeklyDigest: z.boolean().optional(),
                marketAlerts: z.boolean().optional(),
            }).optional(),
        }))
        .mutation(async ({ input }) => {
            const { walletAddress, email, notifications } = input;

            const user = await User.findOneAndUpdate(
                { walletAddress },
                {
                    email,
                    isSubscribed: true,
                    subscribedAt: new Date(),
                    ...(notifications && { notifications: { ...notifications } }),
                },
                { upsert: true, new: true }
            );

            // Send welcome email
            try {
                await emailService.sendWelcomeEmail(email, walletAddress);
            } catch (error) {
                console.error("Failed to send welcome email:", error);
            }

            return {
                success: true,
                user: {
                    walletAddress: user.walletAddress,
                    email: user.email,
                    isSubscribed: user.isSubscribed,
                },
            };
        }),

    // Unsubscribe
    unsubscribe: publicProcedure
        .input(z.object({
            walletAddress: z.string(),
        }))
        .mutation(async ({ input }) => {
            await User.findOneAndUpdate(
                { walletAddress: input.walletAddress },
                { isSubscribed: false }
            );
            return { success: true };
        }),

    // Update notification preferences
    updateNotifications: publicProcedure
        .input(z.object({
            walletAddress: z.string(),
            notifications: z.object({
                protocolHealth: z.boolean().optional(),
                liquidationWarning: z.boolean().optional(),
                positionUpdates: z.boolean().optional(),
                weeklyDigest: z.boolean().optional(),
                marketAlerts: z.boolean().optional(),
            }),
        }))
        .mutation(async ({ input }) => {
            const { walletAddress, notifications } = input;

            const user = await User.findOneAndUpdate(
                { walletAddress },
                { $set: { notifications } },
                { new: true }
            );

            if (!user) {
                throw new Error("User not found");
            }

            return {
                success: true,
                notifications: user.notifications,
            };
        }),

    // Get user info
    getUser: publicProcedure
        .input(z.object({
            walletAddress: z.string(),
        }))
        .query(async ({ input }) => {
            const user = await User.findOne({ walletAddress: input.walletAddress });

            if (!user) {
                return null;
            }

            return {
                walletAddress: user.walletAddress,
                email: user.email,
                isSubscribed: user.isSubscribed,
                notifications: user.notifications,
                firstConnectedAt: user.firstConnectedAt,
                totalConnections: user.totalConnections,
                hasPosition: user.hasPosition,
            };
        }),

    // Get user stats (for admin)
    getStats: publicProcedure.query(async () => {
        const [
            totalUsers,
            subscribedUsers,
            usersWithPositions,
            newUsersToday,
            activeToday,
        ] = await Promise.all([
            User.countDocuments({}),
            User.countDocuments({ isSubscribed: true, email: { $exists: true, $ne: null } }),
            User.countDocuments({ hasPosition: true }),
            User.countDocuments({
                firstConnectedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            }),
            User.countDocuments({
                lastConnectedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            }),
        ]);

        return {
            totalUsers,
            subscribedUsers,
            subscriptionRate: totalUsers > 0 ? Math.round((subscribedUsers / totalUsers) * 100) : 0,
            usersWithPositions,
            newUsersToday,
            activeToday,
        };
    }),

    // Get all subscribed users (for sending notifications)
    getSubscribedUsers: publicProcedure
        .input(z.object({
            notificationType: z.enum([
                "protocolHealth",
                "liquidationWarning",
                "positionUpdates",
                "weeklyDigest",
                "marketAlerts",
            ]).optional(),
        }).optional())
        .query(async ({ input }) => {
            const query: Record<string, unknown> = {
                isSubscribed: true,
                email: { $exists: true, $ne: null },
            };

            if (input?.notificationType) {
                query[`notifications.${input.notificationType}`] = true;
            }

            const users = await User.find(query).select("walletAddress email notifications");
            return users;
        }),

    // Check position health for a user and update
    checkUserPosition: publicProcedure
        .input(z.object({
            walletAddress: z.string(),
        }))
        .mutation(async ({ input }) => {
            const { walletAddress } = input;

            // Check if user has any positions
            const positions = await Position.find({
                owner: walletAddress,
                debtAmount: { $gt: 0 },
            });

            const hasPosition = positions.length > 0;
            const riskyPositions = positions.filter(p => (p.healthFactor || 0) < 120);

            // Update user
            await User.findOneAndUpdate(
                { walletAddress },
                {
                    hasPosition,
                    lastPositionCheck: new Date(),
                }
            );

            // If user is subscribed and has risky positions, we would send email
            // (This is handled by the listener/cron job, not here)

            return {
                hasPosition,
                positionCount: positions.length,
                riskyCount: riskyPositions.length,
                positions: positions.map(p => ({
                    vaultType: p.vaultType,
                    healthFactor: p.healthFactor,
                    debtAmount: p.debtAmount,
                    collateralAmount: p.collateralAmount,
                })),
            };
        }),
});
