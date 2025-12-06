import { z } from "zod";
import { Position } from "../models/Position";
import { VaultType } from "../models/VaultType";
import { publicProcedure, router } from "../trpc";

export const vaultsRouter = router({
    // Get all vault types
    getAll: publicProcedure.query(async () => {
        return VaultType.find({});
    }),

    // Get only active vaults
    getActive: publicProcedure.query(async () => {
        return VaultType.find({ isActive: true });
    }),

    // Get single vault by collateral mint
    getByMint: publicProcedure
        .input(z.object({ collateralMint: z.string() }))
        .query(async ({ input }) => {
            return VaultType.findOne({ collateralMint: input.collateralMint });
        }),

    // Get vault with position count
    getWithStats: publicProcedure.query(async () => {
        const vaults = await VaultType.find({});

        const vaultsWithStats = await Promise.all(
            vaults.map(async (vault) => {
                const positions = await Position.find({
                    vaultType: vault.collateralMint,
                    debtAmount: { $gt: 0 },
                });

                const totalPositions = positions.length;
                const totalDebtFromPositions = positions.reduce((acc, p) => acc + (p.debtAmount || 0), 0);
                const totalCollateralFromPositions = positions.reduce((acc, p) => acc + (p.collateralAmount || 0), 0);
                const avgHealthFactor = positions.length > 0
                    ? positions.reduce((acc, p) => acc + (p.healthFactor || 0), 0) / positions.length
                    : 0;
                const riskyPositions = positions.filter(p => p.healthFactor < 120).length;

                return {
                    ...vault.toObject(),
                    stats: {
                        totalPositions,
                        totalDebtFromPositions,
                        totalCollateralFromPositions,
                        avgHealthFactor: Math.round(avgHealthFactor * 100) / 100,
                        riskyPositions,
                        debtUtilization: vault.vaultDebtCeiling > 0
                            ? Math.round(((vault.totalDebt || 0) / vault.vaultDebtCeiling) * 10000) / 100
                            : 0,
                    },
                };
            })
        );

        return vaultsWithStats;
    }),

    // Get vault summary
    getSummary: publicProcedure.query(async () => {
        const vaults = await VaultType.find({});

        const totalVaults = vaults.length;
        const activeVaults = vaults.filter(v => v.isActive).length;
        const totalCollateral = vaults.reduce((acc, v) => acc + (v.totalCollateral || 0), 0);
        const totalDebt = vaults.reduce((acc, v) => acc + (v.totalDebt || 0), 0);
        const totalDebtCeiling = vaults.reduce((acc, v) => acc + (v.vaultDebtCeiling || 0), 0);

        return {
            totalVaults,
            activeVaults,
            inactiveVaults: totalVaults - activeVaults,
            totalCollateral,
            totalDebt,
            totalDebtCeiling,
            overallUtilization: totalDebtCeiling > 0
                ? Math.round((totalDebt / totalDebtCeiling) * 10000) / 100
                : 0,
        };
    }),

    // Get vault fee configuration
    getFeeConfig: publicProcedure
        .input(z.object({ collateralMint: z.string() }))
        .query(async ({ input }) => {
            const vault = await VaultType.findOne({ collateralMint: input.collateralMint });
            if (!vault) return null;

            return {
                collateralMint: vault.collateralMint,
                mintFeeBps: vault.mintFeeBps,
                redeemFeeBps: vault.redeemFeeBps,
                stabilityFeeBps: vault.stabilityFeeBps,
                liqPenaltyBps: vault.liqPenaltyBps,
                // Convert BPS to percentage for display
                mintFeePercent: vault.mintFeeBps / 100,
                redeemFeePercent: vault.redeemFeeBps / 100,
                stabilityFeePercent: vault.stabilityFeeBps / 100,
                liqPenaltyPercent: vault.liqPenaltyBps / 100,
            };
        }),

    // Get vault risk parameters
    getRiskParams: publicProcedure
        .input(z.object({ collateralMint: z.string() }))
        .query(async ({ input }) => {
            const vault = await VaultType.findOne({ collateralMint: input.collateralMint });
            if (!vault) return null;

            return {
                collateralMint: vault.collateralMint,
                ltvBps: vault.ltvBps,
                liqThresholdBps: vault.liqThresholdBps,
                liqPenaltyBps: vault.liqPenaltyBps,
                // Convert to percentage
                ltvPercent: vault.ltvBps / 100,
                liqThresholdPercent: vault.liqThresholdBps / 100,
                liqPenaltyPercent: vault.liqPenaltyBps / 100,
                // Calculate max borrowable
                maxBorrowPercent: vault.ltvBps / 100,
            };
        }),

    // Get all vault risk parameters
    getAllRiskParams: publicProcedure.query(async () => {
        const vaults = await VaultType.find({});
        return vaults.map(v => ({
            collateralMint: v.collateralMint,
            isActive: v.isActive,
            ltvBps: v.ltvBps,
            liqThresholdBps: v.liqThresholdBps,
            liqPenaltyBps: v.liqPenaltyBps,
            ltvPercent: v.ltvBps / 100,
            liqThresholdPercent: v.liqThresholdBps / 100,
            liqPenaltyPercent: v.liqPenaltyBps / 100,
        }));
    }),

    // Get vault utilization
    getUtilization: publicProcedure.query(async () => {
        const vaults = await VaultType.find({});
        return vaults.map(v => ({
            collateralMint: v.collateralMint,
            isActive: v.isActive,
            totalDebt: v.totalDebt || 0,
            debtCeiling: v.vaultDebtCeiling,
            utilization: v.vaultDebtCeiling > 0
                ? Math.round(((v.totalDebt || 0) / v.vaultDebtCeiling) * 10000) / 100
                : 0,
            remainingCapacity: v.vaultDebtCeiling - (v.totalDebt || 0),
        }));
    }),

    // Get vault collateral info
    getCollateralInfo: publicProcedure.query(async () => {
        const vaults = await VaultType.find({});
        return vaults.map(v => ({
            collateralMint: v.collateralMint,
            oraclePriceAccount: v.oraclePriceAccount,
            totalCollateral: v.totalCollateral || 0,
            isActive: v.isActive,
        }));
    }),

    // Get vault by ID
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            return VaultType.findById(input.id);
        }),

    // Search vaults
    search: publicProcedure
        .input(z.object({ query: z.string() }))
        .query(async ({ input }) => {
            return VaultType.find({
                collateralMint: { $regex: input.query, $options: 'i' }
            });
        }),
});
