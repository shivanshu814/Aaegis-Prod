import { z } from "zod";
import { Analytics } from "../models/Analytics";
import { Position } from "../models/Position";
import { ProtocolState } from "../models/ProtocolState";
import { VaultType } from "../models/VaultType";
import { publicProcedure, router } from "../trpc";

export const analyticsRouter = router({
    // Get current live stats (calculated on the fly)
    getLiveStats: publicProcedure.query(async () => {
        const positions = await Position.find({});
        const vaults = await VaultType.find({});
        const protocol = await ProtocolState.findOne({});

        let tvl = 0;
        let totalDebt = 0;
        let totalCollateralValue = 0;
        let weightedLtvSum = 0;

        // Calculate TVL and Debt
        // Note: In a real app, we'd need real-time prices. 
        // For now, we'll use the last known price from VaultType or estimate.
        // Since we don't have prices in DB easily, we might return raw amounts or use a stored price.

        // Simplified for now:
        totalDebt = positions.reduce((acc, pos) => acc + (pos.debtAmount || 0), 0);

        // Count risky positions (health factor < 1.1)
        const riskyCount = positions.filter(p => (p.healthFactor || 0) < 1.1 && (p.debtAmount || 0) > 0).length;

        return {
            tvl, // Needs price data to be accurate
            totalDebt,
            positionCount: positions.length,
            vaultCount: vaults.length,
            riskyCount,
            globalDebtCeiling: protocol?.globalDebtCeiling || 0,
            totalProtocolDebt: protocol?.totalProtocolDebt || 0,
        };
    }),

    // Get historical data for charts
    getHistory: publicProcedure
        .input(z.object({ days: z.number().default(30) }))
        .query(async ({ input }) => {
            const cutoff = Date.now() - (input.days * 24 * 60 * 60 * 1000);
            return Analytics.find({ timestamp: { $gte: cutoff } }).sort({ timestamp: 1 });
        }),
});
