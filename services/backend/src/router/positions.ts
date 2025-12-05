import { z } from "zod";
import { Position } from "../models/Position";
import { publicProcedure, router } from "../trpc";

export const positionsRouter = router({
    getByOwner: publicProcedure
        .input(z.object({ owner: z.string() }))
        .query(async ({ input }) => {
            const positions = await Position.find({ owner: input.owner });
            return positions;
        }),

    getAll: publicProcedure.query(async () => {
        return await Position.find({});
    }),

    getRisky: publicProcedure
        .input(z.object({ threshold: z.number().default(110) })) // Default 110% health factor
        .query(async ({ input }) => {
            // Assuming healthFactor is stored as percentage (e.g. 150 for 150%)
            // We want positions with healthFactor < threshold
            return await Position.find({ healthFactor: { $lt: input.threshold } });
        }),
});
