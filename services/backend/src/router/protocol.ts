import { Position } from "../models/Position";
import { ProtocolState } from "../models/ProtocolState";
import { VaultType } from "../models/VaultType";
import { publicProcedure, router } from "../trpc";

export const protocolRouter = router({
    // Get current protocol state
    getStats: publicProcedure.query(async () => {
        const protocol = await ProtocolState.findOne({});
        if (!protocol) {
            return null;
        }
        return protocol;
    }),

    // Get protocol overview with calculated metrics
    getOverview: publicProcedure.query(async () => {
        const [protocol, positions, vaults] = await Promise.all([
            ProtocolState.findOne({}),
            Position.find({ debtAmount: { $gt: 0 } }),
            VaultType.find({}),
        ]);

        // Calculate debt utilization
        const debtUtilization = protocol && protocol.globalDebtCeiling > 0
            ? (protocol.totalProtocolDebt / protocol.globalDebtCeiling) * 100
            : 0;

        // Calculate total fees
        const totalFees = protocol
            ? (protocol.totalMintFeesCollected || 0) +
            (protocol.totalRedeemFeesCollected || 0) +
            (protocol.totalLiquidationFeesCollected || 0)
            : 0;

        // Active positions and vaults
        const activePositions = positions.length;
        const activeVaults = vaults.filter(v => v.isActive).length;

        // Risk metrics
        const avgHealthFactor = positions.length > 0
            ? positions.reduce((acc, p) => acc + (p.healthFactor || 0), 0) / positions.length
            : 0;
        const riskyPositions = positions.filter(p => p.healthFactor < 120).length;

        return {
            // Core metrics
            totalProtocolDebt: protocol?.totalProtocolDebt || 0,
            globalDebtCeiling: protocol?.globalDebtCeiling || 0,
            debtUtilization: Math.round(debtUtilization * 100) / 100,

            // Fee metrics
            totalMintFeesCollected: protocol?.totalMintFeesCollected || 0,
            totalRedeemFeesCollected: protocol?.totalRedeemFeesCollected || 0,
            totalLiquidationFeesCollected: protocol?.totalLiquidationFeesCollected || 0,
            totalFees,

            // Fee configuration
            baseMintFeeBps: protocol?.baseMintFeeBps || 0,
            baseRedeemFeeBps: protocol?.baseRedeemFeeBps || 0,
            baseLiquidationPenaltyBps: protocol?.baseLiquidationPenaltyBps || 0,
            baseStabilityFeeBps: protocol?.baseStabilityFeeBps || 0,

            // Risk configuration
            baseCollateralRatioBps: protocol?.baseCollateralRatioBps || 0,
            baseLiquidationThresholdBps: protocol?.baseLiquidationThresholdBps || 0,

            // Positions
            activePositions,
            activeVaults,
            totalVaults: vaults.length,

            // Risk
            avgHealthFactor: Math.round(avgHealthFactor * 100) / 100,
            riskyPositions,

            // Admin info
            adminPubkey: protocol?.adminPubkey || '',
            treasuryPubkey: protocol?.treasuryPubkey || '',
            stablecoinMint: protocol?.stablecoinMint || '',

            // Timestamp
            updatedAt: protocol?.updatedAt || 0,
        };
    }),

    // Get fee configuration
    getFeeConfig: publicProcedure.query(async () => {
        const protocol = await ProtocolState.findOne({});
        return {
            baseMintFeeBps: protocol?.baseMintFeeBps || 0,
            baseRedeemFeeBps: protocol?.baseRedeemFeeBps || 0,
            baseLiquidationPenaltyBps: protocol?.baseLiquidationPenaltyBps || 0,
            baseStabilityFeeBps: protocol?.baseStabilityFeeBps || 0,
        };
    }),

    // Get fee summary
    getFeeSummary: publicProcedure.query(async () => {
        const protocol = await ProtocolState.findOne({});

        const totalMint = protocol?.totalMintFeesCollected || 0;
        const totalRedeem = protocol?.totalRedeemFeesCollected || 0;
        const totalLiquidation = protocol?.totalLiquidationFeesCollected || 0;
        const total = totalMint + totalRedeem + totalLiquidation;

        return {
            totalMintFeesCollected: totalMint,
            totalRedeemFeesCollected: totalRedeem,
            totalLiquidationFeesCollected: totalLiquidation,
            totalFeesCollected: total,
            breakdown: {
                mint: {
                    amount: totalMint,
                    percentage: total > 0 ? Math.round((totalMint / total) * 10000) / 100 : 0,
                },
                redeem: {
                    amount: totalRedeem,
                    percentage: total > 0 ? Math.round((totalRedeem / total) * 10000) / 100 : 0,
                },
                liquidation: {
                    amount: totalLiquidation,
                    percentage: total > 0 ? Math.round((totalLiquidation / total) * 10000) / 100 : 0,
                },
            },
        };
    }),

    // Get debt metrics
    getDebtMetrics: publicProcedure.query(async () => {
        const [protocol, vaults] = await Promise.all([
            ProtocolState.findOne({}),
            VaultType.find({}),
        ]);

        const totalProtocolDebt = protocol?.totalProtocolDebt || 0;
        const globalDebtCeiling = protocol?.globalDebtCeiling || 0;

        // Calculate per-vault debt
        const vaultDebt = vaults.map(v => ({
            collateralMint: v.collateralMint,
            totalDebt: v.totalDebt || 0,
            debtCeiling: v.vaultDebtCeiling,
            utilization: v.vaultDebtCeiling > 0
                ? Math.round(((v.totalDebt || 0) / v.vaultDebtCeiling) * 10000) / 100
                : 0,
        }));

        return {
            totalProtocolDebt,
            globalDebtCeiling,
            globalUtilization: globalDebtCeiling > 0
                ? Math.round((totalProtocolDebt / globalDebtCeiling) * 10000) / 100
                : 0,
            remainingCapacity: globalDebtCeiling - totalProtocolDebt,
            vaultDebt,
        };
    }),

    // Get admin addresses
    getAdminInfo: publicProcedure.query(async () => {
        const protocol = await ProtocolState.findOne({});
        return {
            adminPubkey: protocol?.adminPubkey || '',
            treasuryPubkey: protocol?.treasuryPubkey || '',
            stablecoinMint: protocol?.stablecoinMint || '',
        };
    }),

    // Check if protocol is healthy
    getHealthStatus: publicProcedure.query(async () => {
        const [protocol, positions] = await Promise.all([
            ProtocolState.findOne({}),
            Position.find({ debtAmount: { $gt: 0 } }),
        ]);

        const totalDebt = protocol?.totalProtocolDebt || 0;
        const debtCeiling = protocol?.globalDebtCeiling || 0;
        const debtUtilization = debtCeiling > 0 ? (totalDebt / debtCeiling) * 100 : 0;

        const riskyPositions = positions.filter(p => p.healthFactor < 120).length;
        const criticalPositions = positions.filter(p => p.healthFactor < 100).length;

        // Determine overall health
        let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
        const issues: string[] = [];

        // Check debt utilization
        if (debtUtilization > 90) {
            status = 'CRITICAL';
            issues.push('Debt utilization above 90%');
        } else if (debtUtilization > 75) {
            status = 'WARNING';
            issues.push('Debt utilization above 75%');
        }

        // Check positions - only upgrade severity, never downgrade
        if (criticalPositions > 0) {
            status = 'CRITICAL';
            issues.push(`${criticalPositions} position(s) at liquidation risk`);
        } else if (riskyPositions > 0 && status !== 'CRITICAL') {
            status = 'WARNING';
            issues.push(`${riskyPositions} risky position(s)`);
        }

        return {
            status,
            issues,
            metrics: {
                debtUtilization: Math.round(debtUtilization * 100) / 100,
                riskyPositions,
                criticalPositions,
                totalPositions: positions.length,
            },
        };
    }),
});
