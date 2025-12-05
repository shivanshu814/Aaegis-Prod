import { AegisClient } from "@aegis/sdk";
import { AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { connectDB } from "../db";
import { Analytics } from "../models/Analytics";
import { Position } from "../models/Position";
import { ProtocolState } from "../models/ProtocolState";
import { VaultType } from "../models/VaultType";
import { logger } from "../utils/logger";

// Use Devnet for now
const CONNECTION_URL = process.env.CONNECTION_URL || "https://api.devnet.solana.com";

export const runIndexer = async () => {
    logger.info("Starting Indexer...");

    // Ensure DB is connected
    await connectDB();

    const connection = new Connection(CONNECTION_URL, "confirmed");

    // Create a read-only provider
    const provider = new AnchorProvider(
        connection,
        { publicKey: PublicKey.default, signTransaction: async (tx) => tx, signAllTransactions: async (txs) => txs },
        { commitment: "confirmed" }
    );

    // Initialize SDK Client
    const client = new AegisClient(provider);
    const program = client.program;

    try {
        // 1. Index Protocol State
        logger.info("Indexing Protocol State...");
        const protocolState = await client.fetchProtocolState();
        await ProtocolState.findOneAndUpdate(
            { adminPubkey: protocolState.adminPubkey.toBase58() }, // Assuming single protocol state for now, or key by seed
            {
                adminPubkey: protocolState.adminPubkey.toBase58(),
                treasuryPubkey: protocolState.treasuryPubkey.toBase58(),
                stablecoinMint: protocolState.stablecoinMint.toBase58(),
                totalProtocolDebt: protocolState.totalProtocolDebt.toNumber(),
                globalDebtCeiling: protocolState.globalDebtCeiling.toNumber(),
                updatedAt: protocolState.updatedAt.toNumber(),
            },
            { upsert: true, new: true }
        );

        // 2. Index Vault Types
        logger.info("Indexing Vault Types...");
        const vaultTypes = await program.account.vaultType.all();
        for (const vault of vaultTypes) {
            await VaultType.findOneAndUpdate(
                { collateralMint: vault.account.collateralMint.toBase58() },
                {
                    collateralMint: vault.account.collateralMint.toBase58(),
                    oraclePriceAccount: vault.account.oraclePriceAccount.toBase58(),
                    ltvBps: vault.account.ltvBps.toNumber(),
                    liqThresholdBps: vault.account.liqThresholdBps.toNumber(),
                    liqPenaltyBps: vault.account.liqPenaltyBps.toNumber(),
                    stabilityFeeBps: vault.account.stabilityFeeBps,
                    mintFeeBps: vault.account.mintFeeBps,
                    redeemFeeBps: vault.account.redeemFeeBps,
                    vaultDebtCeiling: vault.account.vaultDebtCeiling.toNumber(),
                    isActive: vault.account.isActive,
                    // totalCollateral/Debt would need to be aggregated from positions if not in VaultType state
                    // VaultType state has reserved space, maybe we should add total metrics there in program?
                    // For now, we can aggregate from positions if needed, or just leave 0.
                },
                { upsert: true }
            );
        }

        // 3. Index Positions
        logger.info("Indexing Positions...");
        const positions = await program.account.position.all();
        for (const pos of positions) {
            await Position.findOneAndUpdate(
                {
                    owner: pos.account.owner.toBase58(),
                    vaultType: pos.account.vaultType.toBase58()
                },
                {
                    owner: pos.account.owner.toBase58(),
                    vaultType: pos.account.vaultType.toBase58(),
                    collateralAmount: pos.account.collateralAmount.toNumber(),
                    debtAmount: pos.account.debtAmount.toNumber(),
                    updatedAt: pos.account.updatedAt.toNumber(),
                    // Calculate Health Factor here if needed, or on query
                    healthFactor: 0 // Placeholder
                },
                { upsert: true }
            );
        }

        // 4. Snapshot Analytics (Daily Metrics)
        logger.info("Snapshotting Analytics...");
        const dbPositions = await Position.find({});

        let totalDebt = 0;
        let riskyCount = 0;
        let totalLtv = 0;
        let positionCount = dbPositions.length;

        for (const pos of dbPositions) {
            totalDebt += (pos.debtAmount || 0);
            if ((pos.healthFactor || 0) < 1.1 && (pos.debtAmount || 0) > 0) {
                riskyCount++;
            }
            // Simplified LTV calc (debt / collateral value) - requires price, skipping for now or using 0
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        await Analytics.findOneAndUpdate(
            { date: today },
            {
                timestamp: Date.now(),
                date: today,
                tvlUsd: 0, // Needs price data
                totalDebtUsd: totalDebt / 1_000_000, // Assuming 6 decimals
                totalPositions: positionCount,
                activeVaults: (await VaultType.countDocuments({ isActive: true })),
                avgLtv: 0, // Placeholder
                riskyPositionsCount: riskyCount,
                totalFeesCollected: 0 // Placeholder
            },
            { upsert: true }
        );

        logger.info("Indexing completed successfully.");

    } catch (error) {
        logger.error("Error running indexer:", error);
    }
};

// If run directly
if (require.main === module) {
    runIndexer().then(() => process.exit(0));
}
