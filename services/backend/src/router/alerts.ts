import { z } from "zod";
import { Alert } from "../models/Alert";
import { publicProcedure, router } from "../trpc";
import { AlertEmailData, emailService } from "../utils/email";

export const alertsRouter = router({
    // Get recent alerts with optional filters
    getRecent: publicProcedure
        .input(z.object({
            limit: z.number().optional().default(20),
            type: z.enum(['LIQUIDATION', 'ORACLE_FAILURE', 'PROTOCOL_PAUSE', 'HEALTH_WARNING']).optional(),
            severity: z.enum(['INFO', 'WARNING', 'CRITICAL']).optional(),
            unreadOnly: z.boolean().optional().default(false),
        }))
        .query(async ({ input }) => {
            const filter: any = {};
            if (input.type) filter.type = input.type;
            if (input.severity) filter.severity = input.severity;
            if (input.unreadOnly) filter.read = false;

            return Alert.find(filter).sort({ timestamp: -1 }).limit(input.limit);
        }),

    // Get unread count
    getUnreadCount: publicProcedure
        .query(async () => {
            return Alert.countDocuments({ read: false });
        }),

    // Mark single alert as read
    markAsRead: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            await Alert.findByIdAndUpdate(input.id, { read: true });
            return { success: true };
        }),

    // Mark all alerts as read
    markAllAsRead: publicProcedure
        .mutation(async () => {
            await Alert.updateMany({ read: false }, { read: true });
            return { success: true };
        }),

    // Create a new alert (internal use - can be called by indexer)
    create: publicProcedure
        .input(z.object({
            type: z.enum(['LIQUIDATION', 'ORACLE_FAILURE', 'PROTOCOL_PAUSE', 'HEALTH_WARNING']),
            severity: z.enum(['INFO', 'WARNING', 'CRITICAL']),
            message: z.string(),
            details: z.any().optional(),
            sendEmail: z.boolean().optional().default(true),
        }))
        .mutation(async ({ input }) => {
            const alert = await Alert.create({
                type: input.type,
                severity: input.severity,
                message: input.message,
                details: input.details,
                timestamp: Date.now(),
                read: false,
            });

            // Send email notification if enabled and email service is ready
            if (input.sendEmail && emailService.isReady()) {
                const emailData: AlertEmailData = {
                    type: input.type,
                    severity: input.severity,
                    message: input.message,
                    details: input.details,
                    timestamp: Date.now(),
                };
                await emailService.sendAlertEmail(emailData);
            }

            return alert;
        }),

    // Delete a single alert
    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            await Alert.findByIdAndDelete(input.id);
            return { success: true };
        }),

    // Clear all alerts
    clearAll: publicProcedure
        .mutation(async () => {
            await Alert.deleteMany({});
            return { success: true };
        }),

    // Get alert stats
    getStats: publicProcedure
        .query(async () => {
            const [total, unread, bySeverity, byType] = await Promise.all([
                Alert.countDocuments(),
                Alert.countDocuments({ read: false }),
                Alert.aggregate([
                    { $group: { _id: "$severity", count: { $sum: 1 } } }
                ]),
                Alert.aggregate([
                    { $group: { _id: "$type", count: { $sum: 1 } } }
                ]),
            ]);

            return {
                total,
                unread,
                bySeverity: bySeverity.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {} as Record<string, number>),
                byType: byType.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {} as Record<string, number>),
            };
        }),

    // Email settings
    getEmailStatus: publicProcedure
        .query(async () => {
            return {
                configured: emailService.isReady(),
            };
        }),

    // Test email
    sendTestEmail: publicProcedure
        .mutation(async () => {
            if (!emailService.isReady()) {
                return { success: false, message: "Email service is not configured" };
            }
            const sent = await emailService.sendTestEmail();
            return {
                success: sent,
                message: sent ? "Test email sent successfully!" : "Failed to send test email",
            };
        }),

    // Resend email for existing alert
    resendEmail: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            const alert = await Alert.findById(input.id);
            if (!alert) {
                return { success: false, message: "Alert not found" };
            }

            if (!emailService.isReady()) {
                return { success: false, message: "Email service is not configured" };
            }

            const emailData: AlertEmailData = {
                type: alert.type as any,
                severity: alert.severity as any,
                message: alert.message,
                details: alert.details,
                timestamp: alert.timestamp,
            };

            const sent = await emailService.sendAlertEmail(emailData);
            return {
                success: sent,
                message: sent ? "Email resent successfully!" : "Failed to resend email",
            };
        }),
});
