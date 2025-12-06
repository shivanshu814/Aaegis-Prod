import { z } from "zod";
import { FeeLog } from "../models/FeeLog";
import { LiquidationLog } from "../models/LiquidationLog";
import { ProtocolState } from "../models/ProtocolState";
import { publicProcedure, router } from "../trpc";

export const feesRouter = router({
    // Get fee summary stats
    getFeeSummary: publicProcedure.query(async () => {
        // Aggregate fees by type from transaction logs
        const aggregation = await FeeLog.aggregate([
            {
                $group: {
                    _id: "$type",
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert to object format
        const feesByType: Record<string, { amount: number; count: number }> = {
            mint: { amount: 0, count: 0 },
            redeem: { amount: 0, count: 0 },
            stability: { amount: 0, count: 0 },
            liquidation: { amount: 0, count: 0 },
        };

        aggregation.forEach((item: { _id: string; totalAmount: number; count: number }) => {
            feesByType[item._id] = {
                amount: item.totalAmount,
                count: item.count,
            };
        });

        // Calculate totals from logs
        const totalFeesCollected = Object.values(feesByType).reduce((acc, v) => acc + v.amount, 0);
        const totalTransactions = Object.values(feesByType).reduce((acc, v) => acc + v.count, 0);

        // Get on-chain protocol state for authoritative fee totals
        const protocolState = await ProtocolState.findOne({});
        const onChainFees = {
            mint: protocolState?.totalMintFeesCollected || 0,
            redeem: protocolState?.totalRedeemFeesCollected || 0,
            liquidation: protocolState?.totalLiquidationFeesCollected || 0,
            total: (protocolState?.totalMintFeesCollected || 0) +
                (protocolState?.totalRedeemFeesCollected || 0) +
                (protocolState?.totalLiquidationFeesCollected || 0),
        };

        // Get total liquidation count and value
        const liquidationStats = await LiquidationLog.aggregate([
            {
                $group: {
                    _id: null,
                    totalDebtRepaid: { $sum: "$debtRepaid" },
                    totalPenaltyFees: { $sum: "$penaltyFee" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const liqStats = liquidationStats[0] || { totalDebtRepaid: 0, totalPenaltyFees: 0, count: 0 };

        return {
            feesByType,
            totalFeesCollected, // From transaction logs
            totalTransactions,
            onChainFees, // Authoritative from protocol state
            liquidations: {
                count: liqStats.count,
                totalDebtRepaid: liqStats.totalDebtRepaid,
                totalPenaltyFees: liqStats.totalPenaltyFees,
            },
        };
    }),


    // Get recent fee logs with pagination
    getRecentFees: publicProcedure
        .input(z.object({
            limit: z.number().default(20),
            offset: z.number().default(0),
            type: z.enum(['mint', 'redeem', 'stability', 'liquidation', 'all']).default('all'),
        }))
        .query(async ({ input }) => {
            const filter = input.type === 'all' ? {} : { type: input.type };

            const [logs, total] = await Promise.all([
                FeeLog.find(filter)
                    .sort({ timestamp: -1 })
                    .skip(input.offset)
                    .limit(input.limit)
                    .lean(),
                FeeLog.countDocuments(filter),
            ]);

            return {
                logs,
                total,
                hasMore: input.offset + logs.length < total,
            };
        }),

    // Get recent liquidations with pagination  
    getRecentLiquidations: publicProcedure
        .input(z.object({
            limit: z.number().default(20),
            offset: z.number().default(0),
        }))
        .query(async ({ input }) => {
            const [logs, total] = await Promise.all([
                LiquidationLog.find({})
                    .sort({ timestamp: -1 })
                    .skip(input.offset)
                    .limit(input.limit)
                    .lean(),
                LiquidationLog.countDocuments({}),
            ]);

            return {
                logs,
                total,
                hasMore: input.offset + logs.length < total,
            };
        }),

    // Get daily fee stats for charting
    getDailyFeeStats: publicProcedure
        .input(z.object({ days: z.number().default(30) }))
        .query(async ({ input }) => {
            const cutoffMs = Date.now() - (input.days * 24 * 60 * 60 * 1000);

            const dailyStats = await FeeLog.aggregate([
                { $match: { timestamp: { $gte: cutoffMs } } },
                {
                    $group: {
                        _id: {
                            date: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: { $toDate: "$timestamp" }
                                }
                            },
                            type: "$type"
                        },
                        totalAmount: { $sum: "$amount" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.date": 1 } }
            ]);

            return dailyStats;
        }),

    // Get fee revenue by vault type
    getFeesByVault: publicProcedure.query(async () => {
        const vaultFees = await FeeLog.aggregate([
            {
                $group: {
                    _id: "$vaultType",
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        return vaultFees;
    }),
});
