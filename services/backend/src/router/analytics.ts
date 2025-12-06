import { z } from "zod";
import { Analytics } from "../models/Analytics";
import { FeeLog } from "../models/FeeLog";
import { LiquidationLog } from "../models/LiquidationLog";
import { Position } from "../models/Position";
import { ProtocolState } from "../models/ProtocolState";
import { VaultType } from "../models/VaultType";
import { publicProcedure, router } from "../trpc";

export const analyticsRouter = router({
    // Get current live stats (calculated on the fly)
    getLiveStats: publicProcedure.query(async () => {
        const [positions, vaults, protocol] = await Promise.all([
            Position.find({}),
            VaultType.find({}),
            ProtocolState.findOne({}),
        ]);

        // Active positions (with debt > 0)
        const activePositions = positions.filter(p => (p.debtAmount || 0) > 0);

        // Calculate totals
        const totalDebt = activePositions.reduce((acc, pos) => acc + (pos.debtAmount || 0), 0);
        const totalCollateral = activePositions.reduce((acc, pos) => acc + (pos.collateralAmount || 0), 0);

        // TVL from vaults
        const tvl = vaults.reduce((acc, v) => acc + (v.totalCollateral || 0), 0);

        // Risk metrics
        const riskyCount = activePositions.filter(p => (p.healthFactor || 0) < 120).length;
        const criticalCount = activePositions.filter(p => (p.healthFactor || 0) < 100).length;

        // Average health factor
        const avgHealthFactor = activePositions.length > 0
            ? activePositions.reduce((acc, p) => acc + (p.healthFactor || 0), 0) / activePositions.length
            : 0;

        // Fee totals
        const totalFees = protocol
            ? (protocol.totalMintFeesCollected || 0) +
            (protocol.totalRedeemFeesCollected || 0) +
            (protocol.totalLiquidationFeesCollected || 0)
            : 0;

        return {
            // Core metrics
            tvl,
            totalDebt,
            totalCollateral,
            positionCount: positions.length,
            activePositionCount: activePositions.length,
            vaultCount: vaults.length,
            activeVaultCount: vaults.filter(v => v.isActive).length,

            // Risk metrics
            riskyCount,
            criticalCount,
            avgHealthFactor: Math.round(avgHealthFactor * 100) / 100,

            // Protocol state
            globalDebtCeiling: protocol?.globalDebtCeiling || 0,
            totalProtocolDebt: protocol?.totalProtocolDebt || 0,
            debtUtilization: protocol?.globalDebtCeiling
                ? Math.round(((protocol.totalProtocolDebt || 0) / protocol.globalDebtCeiling) * 10000) / 100
                : 0,

            // Fees
            totalFees,
            totalMintFees: protocol?.totalMintFeesCollected || 0,
            totalRedeemFees: protocol?.totalRedeemFeesCollected || 0,
            totalLiquidationFees: protocol?.totalLiquidationFeesCollected || 0,
        };
    }),

    // Get historical data for charts
    getHistory: publicProcedure
        .input(z.object({ days: z.number().default(30) }))
        .query(async ({ input }) => {
            const cutoff = Date.now() - (input.days * 24 * 60 * 60 * 1000);
            return Analytics.find({ timestamp: { $gte: cutoff } }).sort({ timestamp: 1 });
        }),

    // Get TVL history
    getTvlHistory: publicProcedure
        .input(z.object({ days: z.number().default(30) }))
        .query(async ({ input }) => {
            const cutoff = Date.now() - (input.days * 24 * 60 * 60 * 1000);
            const data = await Analytics.find({ timestamp: { $gte: cutoff } })
                .select('timestamp date tvlUsd')
                .sort({ timestamp: 1 });
            return data;
        }),

    // Get debt history
    getDebtHistory: publicProcedure
        .input(z.object({ days: z.number().default(30) }))
        .query(async ({ input }) => {
            const cutoff = Date.now() - (input.days * 24 * 60 * 60 * 1000);
            const data = await Analytics.find({ timestamp: { $gte: cutoff } })
                .select('timestamp date totalDebtUsd')
                .sort({ timestamp: 1 });
            return data;
        }),

    // Get position count history
    getPositionHistory: publicProcedure
        .input(z.object({ days: z.number().default(30) }))
        .query(async ({ input }) => {
            const cutoff = Date.now() - (input.days * 24 * 60 * 60 * 1000);
            const data = await Analytics.find({ timestamp: { $gte: cutoff } })
                .select('timestamp date totalPositions riskyPositionsCount')
                .sort({ timestamp: 1 });
            return data;
        }),

    // Get fee history
    getFeeHistory: publicProcedure
        .input(z.object({ days: z.number().default(30) }))
        .query(async ({ input }) => {
            const cutoff = Date.now() - (input.days * 24 * 60 * 60 * 1000);
            const data = await Analytics.find({ timestamp: { $gte: cutoff } })
                .select('timestamp date totalFeesCollected')
                .sort({ timestamp: 1 });
            return data;
        }),

    // Get daily fee breakdown
    getDailyFees: publicProcedure
        .input(z.object({ days: z.number().default(30) }))
        .query(async ({ input }) => {
            const cutoff = Date.now() - (input.days * 24 * 60 * 60 * 1000);

            const result = await FeeLog.aggregate([
                { $match: { timestamp: { $gte: cutoff } } },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: { $toDate: "$timestamp" }
                            }
                        },
                        totalFees: { $sum: "$amount" },
                        count: { $sum: 1 },
                        mintFees: {
                            $sum: { $cond: [{ $eq: ["$feeType", "MINT"] }, "$amount", 0] }
                        },
                        redeemFees: {
                            $sum: { $cond: [{ $eq: ["$feeType", "REDEEM"] }, "$amount", 0] }
                        },
                        stabilityFees: {
                            $sum: { $cond: [{ $eq: ["$feeType", "STABILITY"] }, "$amount", 0] }
                        },
                    }
                },
                { $sort: { _id: 1 } },
            ]);

            return result.map(r => ({
                date: r._id,
                totalFees: r.totalFees,
                count: r.count,
                mintFees: r.mintFees,
                redeemFees: r.redeemFees,
                stabilityFees: r.stabilityFees,
            }));
        }),

    // Get daily liquidations
    getDailyLiquidations: publicProcedure
        .input(z.object({ days: z.number().default(30) }))
        .query(async ({ input }) => {
            const cutoff = Date.now() - (input.days * 24 * 60 * 60 * 1000);

            const result = await LiquidationLog.aggregate([
                { $match: { timestamp: { $gte: cutoff } } },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: { $toDate: "$timestamp" }
                            }
                        },
                        count: { $sum: 1 },
                        totalDebtRepaid: { $sum: "$debtRepaid" },
                        totalCollateralSeized: { $sum: "$collateralSeized" },
                        totalPenalty: { $sum: "$penaltyFee" },
                    }
                },
                { $sort: { _id: 1 } },
            ]);

            return result.map(r => ({
                date: r._id,
                count: r.count,
                totalDebtRepaid: r.totalDebtRepaid,
                totalCollateralSeized: r.totalCollateralSeized,
                totalPenalty: r.totalPenalty,
            }));
        }),

    // Get vault breakdown
    getVaultBreakdown: publicProcedure.query(async () => {
        const vaults = await VaultType.find({});

        const breakdown = vaults.map(v => ({
            collateralMint: v.collateralMint,
            isActive: v.isActive,
            totalCollateral: v.totalCollateral || 0,
            totalDebt: v.totalDebt || 0,
            debtCeiling: v.vaultDebtCeiling,
            utilization: v.vaultDebtCeiling > 0
                ? Math.round(((v.totalDebt || 0) / v.vaultDebtCeiling) * 10000) / 100
                : 0,
        }));

        const totals = {
            totalCollateral: breakdown.reduce((acc, v) => acc + v.totalCollateral, 0),
            totalDebt: breakdown.reduce((acc, v) => acc + v.totalDebt, 0),
            totalDebtCeiling: breakdown.reduce((acc, v) => acc + v.debtCeiling, 0),
        };

        return { breakdown, totals };
    }),

    // Get risk distribution
    getRiskDistribution: publicProcedure.query(async () => {
        const positions = await Position.find({ debtAmount: { $gt: 0 } });

        const distribution = {
            critical: positions.filter(p => p.healthFactor < 100).length,
            warning: positions.filter(p => p.healthFactor >= 100 && p.healthFactor < 120).length,
            healthy: positions.filter(p => p.healthFactor >= 120 && p.healthFactor < 150).length,
            safe: positions.filter(p => p.healthFactor >= 150).length,
        };

        const total = positions.length;
        const percentages = {
            critical: total > 0 ? Math.round((distribution.critical / total) * 10000) / 100 : 0,
            warning: total > 0 ? Math.round((distribution.warning / total) * 10000) / 100 : 0,
            healthy: total > 0 ? Math.round((distribution.healthy / total) * 10000) / 100 : 0,
            safe: total > 0 ? Math.round((distribution.safe / total) * 10000) / 100 : 0,
        };

        return { distribution, percentages, total };
    }),

    // Get top metrics
    getTopMetrics: publicProcedure.query(async () => {
        const [topDebtPositions, topCollateralPositions, vaults] = await Promise.all([
            Position.find({ debtAmount: { $gt: 0 } }).sort({ debtAmount: -1 }).limit(5),
            Position.find({ collateralAmount: { $gt: 0 } }).sort({ collateralAmount: -1 }).limit(5),
            VaultType.find({}).sort({ totalDebt: -1 }).limit(5),
        ]);

        return {
            topDebtPositions: topDebtPositions.map(p => ({
                owner: p.owner,
                vaultType: p.vaultType,
                debtAmount: p.debtAmount,
                healthFactor: p.healthFactor,
            })),
            topCollateralPositions: topCollateralPositions.map(p => ({
                owner: p.owner,
                vaultType: p.vaultType,
                collateralAmount: p.collateralAmount,
                healthFactor: p.healthFactor,
            })),
            topVaultsByDebt: vaults.map(v => ({
                collateralMint: v.collateralMint,
                totalDebt: v.totalDebt || 0,
                totalCollateral: v.totalCollateral || 0,
            })),
        };
    }),

    // Get protocol health score
    getHealthScore: publicProcedure.query(async () => {
        const [protocol, positions, vaults] = await Promise.all([
            ProtocolState.findOne({}),
            Position.find({ debtAmount: { $gt: 0 } }),
            VaultType.find({}),
        ]);

        // Scoring factors (0-100 each)
        let debtUtilizationScore = 100;
        let riskScore = 100;
        let diversificationScore = 100;

        // Debt utilization score
        if (protocol?.globalDebtCeiling && protocol.globalDebtCeiling > 0) {
            const utilization = (protocol.totalProtocolDebt || 0) / protocol.globalDebtCeiling;
            debtUtilizationScore = Math.max(0, Math.round((1 - utilization) * 100));
        }

        // Risk score based on risky positions
        const activePositions = positions.filter(p => p.debtAmount > 0);
        if (activePositions.length > 0) {
            const riskyCount = activePositions.filter(p => p.healthFactor < 120).length;
            const riskyRatio = riskyCount / activePositions.length;
            riskScore = Math.max(0, Math.round((1 - riskyRatio) * 100));
        }

        // Diversification score based on vault distribution
        if (vaults.length > 0) {
            const totalDebt = vaults.reduce((acc, v) => acc + (v.totalDebt || 0), 0);
            if (totalDebt > 0) {
                // Calculate concentration (Herfindahl index style)
                const shares = vaults.map(v => ((v.totalDebt || 0) / totalDebt) ** 2);
                const hhi = shares.reduce((acc, s) => acc + s, 0);
                diversificationScore = Math.max(0, Math.round((1 - hhi) * 100));
            }
        }

        // Overall score (weighted average)
        const overallScore = Math.round(
            (debtUtilizationScore * 0.4) +
            (riskScore * 0.4) +
            (diversificationScore * 0.2)
        );

        // Determine grade
        let grade: 'A' | 'B' | 'C' | 'D' | 'F';
        if (overallScore >= 90) grade = 'A';
        else if (overallScore >= 80) grade = 'B';
        else if (overallScore >= 70) grade = 'C';
        else if (overallScore >= 60) grade = 'D';
        else grade = 'F';

        return {
            overallScore,
            grade,
            components: {
                debtUtilization: debtUtilizationScore,
                riskManagement: riskScore,
                diversification: diversificationScore,
            },
        };
    }),

    // Store snapshot (for cron job or indexer)
    storeSnapshot: publicProcedure.mutation(async () => {
        const [positions, vaults, protocol] = await Promise.all([
            Position.find({ debtAmount: { $gt: 0 } }),
            VaultType.find({}),
            ProtocolState.findOne({}),
        ]);

        const now = Date.now();
        const date = new Date(now).toISOString().split('T')[0];

        const tvlUsd = vaults.reduce((acc, v) => acc + (v.totalCollateral || 0), 0);
        const totalDebtUsd = vaults.reduce((acc, v) => acc + (v.totalDebt || 0), 0);
        const avgLtv = positions.length > 0
            ? positions.reduce((acc, p) => {
                if (p.collateralAmount > 0) {
                    return acc + (p.debtAmount / p.collateralAmount);
                }
                return acc;
            }, 0) / positions.length * 100
            : 0;

        const totalFees = protocol
            ? (protocol.totalMintFeesCollected || 0) +
            (protocol.totalRedeemFeesCollected || 0) +
            (protocol.totalLiquidationFeesCollected || 0)
            : 0;

        const snapshot = await Analytics.create({
            timestamp: now,
            date,
            tvlUsd,
            totalDebtUsd,
            totalPositions: positions.length,
            activeVaults: vaults.filter(v => v.isActive).length,
            avgLtv: Math.round(avgLtv * 100) / 100,
            riskyPositionsCount: positions.filter(p => p.healthFactor < 120).length,
            totalFeesCollected: totalFees,
        });

        return { success: true, snapshot };
    }),
});
