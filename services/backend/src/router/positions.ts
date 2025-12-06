import { z } from "zod";
import { Position } from "../models/Position";
import { publicProcedure, router } from "../trpc";

export const positionsRouter = router({
    // Get positions by owner
    getByOwner: publicProcedure
        .input(z.object({ owner: z.string() }))
        .query(async ({ input }) => {
            const positions = await Position.find({ owner: input.owner });
            return positions;
        }),

    // Get all positions with pagination
    getAll: publicProcedure
        .input(z.object({
            limit: z.number().optional().default(50),
            offset: z.number().optional().default(0),
            sortBy: z.enum(['debtAmount', 'collateralAmount', 'healthFactor', 'updatedAt']).optional().default('updatedAt'),
            sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
        }))
        .query(async ({ input }) => {
            const sort: Record<string, 1 | -1> = { [input.sortBy]: input.sortOrder === 'asc' ? 1 : -1 };
            const [positions, total] = await Promise.all([
                Position.find({}).sort(sort).skip(input.offset).limit(input.limit),
                Position.countDocuments({}),
            ]);
            return { positions, total, limit: input.limit, offset: input.offset };
        }),

    // Get single position by owner and vault
    getOne: publicProcedure
        .input(z.object({
            owner: z.string(),
            vaultType: z.string(),
        }))
        .query(async ({ input }) => {
            return Position.findOne({ owner: input.owner, vaultType: input.vaultType });
        }),

    // Get risky positions (low health factor)
    getRisky: publicProcedure
        .input(z.object({
            threshold: z.number().default(120),
            limit: z.number().optional().default(50),
        }))
        .query(async ({ input }) => {
            const positions = await Position.find({
                healthFactor: { $lt: input.threshold, $gt: 0 },
                debtAmount: { $gt: 0 },
            })
                .sort({ healthFactor: 1 })
                .limit(input.limit);
            return positions;
        }),

    // Get positions at liquidation risk (< 100%)
    getAtRisk: publicProcedure
        .input(z.object({ limit: z.number().optional().default(20) }))
        .query(async ({ input }) => {
            return Position.find({
                healthFactor: { $lt: 100, $gt: 0 },
                debtAmount: { $gt: 0 },
            })
                .sort({ healthFactor: 1 })
                .limit(input.limit);
        }),

    // Get positions by vault type
    getByVault: publicProcedure
        .input(z.object({
            vaultType: z.string(),
            limit: z.number().optional().default(50),
        }))
        .query(async ({ input }) => {
            return Position.find({ vaultType: input.vaultType })
                .sort({ debtAmount: -1 })
                .limit(input.limit);
        }),

    // Get position statistics
    getStats: publicProcedure.query(async () => {
        const positions = await Position.find({ debtAmount: { $gt: 0 } });

        if (positions.length === 0) {
            return {
                totalPositions: 0,
                activePositions: 0,
                totalCollateral: 0,
                totalDebt: 0,
                avgHealthFactor: 0,
                riskyCount: 0,
                atRiskCount: 0,
                healthDistribution: {
                    critical: 0,   // < 100%
                    warning: 0,    // 100-120%
                    healthy: 0,    // 120-150%
                    safe: 0,       // > 150%
                },
            };
        }

        const totalPositions = await Position.countDocuments({});
        const activePositions = positions.length;
        const totalCollateral = positions.reduce((acc, p) => acc + (p.collateralAmount || 0), 0);
        const totalDebt = positions.reduce((acc, p) => acc + (p.debtAmount || 0), 0);
        const avgHealthFactor = positions.reduce((acc, p) => acc + (p.healthFactor || 0), 0) / positions.length;

        const riskyCount = positions.filter(p => p.healthFactor < 120).length;
        const atRiskCount = positions.filter(p => p.healthFactor < 100).length;

        const healthDistribution = {
            critical: positions.filter(p => p.healthFactor < 100).length,
            warning: positions.filter(p => p.healthFactor >= 100 && p.healthFactor < 120).length,
            healthy: positions.filter(p => p.healthFactor >= 120 && p.healthFactor < 150).length,
            safe: positions.filter(p => p.healthFactor >= 150).length,
        };

        return {
            totalPositions,
            activePositions,
            totalCollateral,
            totalDebt,
            avgHealthFactor: Math.round(avgHealthFactor * 100) / 100,
            riskyCount,
            atRiskCount,
            healthDistribution,
        };
    }),

    // Get top positions by debt
    getTopByDebt: publicProcedure
        .input(z.object({ limit: z.number().optional().default(10) }))
        .query(async ({ input }) => {
            return Position.find({ debtAmount: { $gt: 0 } })
                .sort({ debtAmount: -1 })
                .limit(input.limit);
        }),

    // Get top positions by collateral
    getTopByCollateral: publicProcedure
        .input(z.object({ limit: z.number().optional().default(10) }))
        .query(async ({ input }) => {
            return Position.find({ collateralAmount: { $gt: 0 } })
                .sort({ collateralAmount: -1 })
                .limit(input.limit);
        }),

    // Search positions by owner address
    search: publicProcedure
        .input(z.object({
            query: z.string(),
            limit: z.number().optional().default(20),
        }))
        .query(async ({ input }) => {
            return Position.find({
                owner: { $regex: input.query, $options: 'i' }
            }).limit(input.limit);
        }),

    // Get position count by vault
    getCountByVault: publicProcedure.query(async () => {
        const result = await Position.aggregate([
            { $match: { debtAmount: { $gt: 0 } } },
            {
                $group: {
                    _id: "$vaultType",
                    count: { $sum: 1 },
                    totalDebt: { $sum: "$debtAmount" },
                    totalCollateral: { $sum: "$collateralAmount" },
                    avgHealthFactor: { $avg: "$healthFactor" },
                }
            },
            { $sort: { totalDebt: -1 } },
        ]);
        return result;
    }),

    // Get recently updated positions
    getRecent: publicProcedure
        .input(z.object({ limit: z.number().optional().default(20) }))
        .query(async ({ input }) => {
            return Position.find({})
                .sort({ updatedAt: -1 })
                .limit(input.limit);
        }),
});
