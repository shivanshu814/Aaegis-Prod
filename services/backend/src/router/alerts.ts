import { z } from "zod";
import { Alert } from "../models/Alert";
import { publicProcedure, router } from "../trpc";

export const alertsRouter = router({
    getRecent: publicProcedure
        .input(z.object({ limit: z.number().optional().default(20) }))
        .query(async ({ input }) => {
            return Alert.find().sort({ timestamp: -1 }).limit(input.limit);
        }),

    getUnreadCount: publicProcedure
        .query(async () => {
            return Alert.countDocuments({ read: false });
        }),

    markAsRead: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            await Alert.findByIdAndUpdate(input.id, { read: true });
            return { success: true };
        }),
});
