import { AegisClient } from "@aegis/sdk";
import { AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { Analytics } from "../models/Analytics";
import { Position } from "../models/Position";
import { ProtocolState } from "../models/ProtocolState";
import { VaultType } from "../models/VaultType";
import { logger } from "../utils/logger";
import { indexRecentTransactions, startTransactionListener } from "./fee-indexer";

const CONNECTION_URL = process.env.CONNECTION_URL || "https://api.devnet.solana.com";

// Polling intervals
const PROTOCOL_STATE_INTERVAL = 30 * 1000; // 30 seconds
const POSITIONS_INTERVAL = 60 * 1000; // 1 minute
const VAULT_TYPES_INTERVAL = 2 * 60 * 1000; // 2 minutes
const ANALYTICS_SNAPSHOT_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Cache for tracking last update times
const cache = {
    lastProtocolUpdate: 0,
    lastPositionsUpdate: 0,
    lastVaultTypesUpdate: 0,
    lastAnalyticsSnapshot: 0,
    isRunning: false,
};

// Store interval IDs for cleanup on restart
let intervalIds: NodeJS.Timeout[] = [];

// Create read-only SDK client
let client: AegisClient | null = null;

function getClient(): AegisClient {
    if (!client) {
        const connection = new Connection(CONNECTION_URL, "confirmed");
        const provider = new AnchorProvider(
            connection,
            { publicKey: PublicKey.default, signTransaction: async (tx) => tx, signAllTransactions: async (txs) => txs },
            { commitment: "confirmed" }
        );
        client = new AegisClient(provider);
    }
    return client;
}

/**
 * Update Protocol State in DB
 * This is the most frequently updated data
 */
export async function syncProtocolState(): Promise<boolean> {
    try {
        const sdk = getClient();
        const protocolState = await sdk.fetchProtocolState();

        await ProtocolState.findOneAndUpdate(
            { adminPubkey: protocolState.adminPubkey.toBase58() },
            {
                adminPubkey: protocolState.adminPubkey.toBase58(),
                treasuryPubkey: protocolState.treasuryPubkey.toBase58(),
                stablecoinMint: protocolState.stablecoinMint.toBase58(),
                totalProtocolDebt: protocolState.totalProtocolDebt.toNumber(),
                globalDebtCeiling: protocolState.globalDebtCeiling.toNumber(),
                totalMintFeesCollected: protocolState.totalMintFeesCollected?.toNumber() || 0,
                totalRedeemFeesCollected: protocolState.totalRedeemFeesCollected?.toNumber() || 0,
                totalLiquidationFeesCollected: protocolState.totalLiquidationFeesCollected?.toNumber() || 0,
                baseMintFeeBps: protocolState.baseMintFeeBps || 0,
                baseRedeemFeeBps: protocolState.baseRedeemFeeBps || 0,
                baseLiquidationPenaltyBps: protocolState.baseLiquidationPenaltyBps?.toNumber() || 0,
                updatedAt: Date.now(),
            },
            { upsert: true, new: true }
        );

        cache.lastProtocolUpdate = Date.now();
        return true;
    } catch (error) {
        logger.error("Failed to sync protocol state:", error);
        return false;
    }
}

/**
 * Update Vault Types in DB
 */
export async function syncVaultTypes(): Promise<boolean> {
    try {
        const sdk = getClient();
        const program = sdk.program;
        const vaultTypes = await program.account.vaultType.all();

        for (const vault of vaultTypes) {
            // Aggregate position data for this vault
            const positions = await Position.find({
                vaultType: vault.account.collateralMint.toBase58(),
                debtAmount: { $gt: 0 }
            });

            const totalCollateral = positions.reduce((acc, p) => acc + (p.collateralAmount || 0), 0);
            const totalDebt = positions.reduce((acc, p) => acc + (p.debtAmount || 0), 0);

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
                    totalCollateral,
                    totalDebt,
                },
                { upsert: true }
            );
        }

        cache.lastVaultTypesUpdate = Date.now();
        return true;
    } catch (error) {
        logger.error("Failed to sync vault types:", error);
        return false;
    }
}

/**
 * Update Positions in DB with health factor calculation
 */
export async function syncPositions(): Promise<boolean> {
    try {
        const sdk = getClient();
        const program = sdk.program;
        const positions = await program.account.position.all();

        // Get vault types for health factor calculation
        const vaultTypes = await VaultType.find({});
        const vaultMap = new Map(vaultTypes.map(v => [v.collateralMint, v]));

        for (const pos of positions) {
            const vaultTypeMint = pos.account.vaultType.toBase58();
            const vault = vaultMap.get(vaultTypeMint);

            // Calculate health factor
            let healthFactor = 0;
            const collateralAmount = pos.account.collateralAmount.toNumber();
            const debtAmount = pos.account.debtAmount.toNumber();

            if (vault && debtAmount > 0 && collateralAmount > 0) {
                // Health Factor = (Collateral * LiqThreshold) / Debt
                // This is simplified - in real app, we'd need oracle price
                const liqThreshold = vault.liqThresholdBps / 10000; // Convert bps to decimal
                healthFactor = (collateralAmount * liqThreshold) / debtAmount * 100;
            } else if (collateralAmount > 0 && debtAmount === 0) {
                healthFactor = 999; // No debt = infinite health
            }

            await Position.findOneAndUpdate(
                {
                    owner: pos.account.owner.toBase58(),
                    vaultType: vaultTypeMint
                },
                {
                    owner: pos.account.owner.toBase58(),
                    vaultType: vaultTypeMint,
                    collateralAmount,
                    debtAmount,
                    updatedAt: Date.now(),
                    healthFactor: Math.round(healthFactor * 100) / 100,
                },
                { upsert: true }
            );
        }

        cache.lastPositionsUpdate = Date.now();
        return true;
    } catch (error) {
        logger.error("Failed to sync positions:", error);
        return false;
    }
}

/**
 * Create analytics snapshot
 */
export async function createAnalyticsSnapshot(): Promise<boolean> {
    try {
        const [positions, vaults, protocol] = await Promise.all([
            Position.find({ debtAmount: { $gt: 0 } }),
            VaultType.find({}),
            ProtocolState.findOne({}),
        ]);

        const today = new Date().toISOString().split('T')[0];

        const tvlUsd = vaults.reduce((acc, v) => acc + (v.totalCollateral || 0), 0);
        const totalDebtUsd = vaults.reduce((acc, v) => acc + (v.totalDebt || 0), 0);
        const riskyCount = positions.filter(p => (p.healthFactor || 0) < 120).length;

        const avgLtv = positions.length > 0
            ? positions.reduce((acc, p) => {
                if (p.collateralAmount > 0) {
                    return acc + ((p.debtAmount || 0) / p.collateralAmount);
                }
                return acc;
            }, 0) / positions.length * 100
            : 0;

        const totalFees = protocol
            ? (protocol.totalMintFeesCollected || 0) +
            (protocol.totalRedeemFeesCollected || 0) +
            (protocol.totalLiquidationFeesCollected || 0)
            : 0;

        await Analytics.findOneAndUpdate(
            { date: today },
            {
                timestamp: Date.now(),
                date: today,
                tvlUsd,
                totalDebtUsd,
                totalPositions: positions.length,
                activeVaults: vaults.filter(v => v.isActive).length,
                avgLtv: Math.round(avgLtv * 100) / 100,
                riskyPositionsCount: riskyCount,
                totalFeesCollected: totalFees,
            },
            { upsert: true }
        );

        cache.lastAnalyticsSnapshot = Date.now();
        return true;
    } catch (error) {
        logger.error("Failed to create analytics snapshot:", error);
        return false;
    }
}

/**
 * Full sync - runs all sync operations
 */
export async function fullSync(): Promise<void> {
    logger.info("🔄 Running full sync...");

    await syncProtocolState();
    await syncVaultTypes();
    await syncPositions();
    await createAnalyticsSnapshot();

    logger.info("✅ Full sync completed");
}

/**
 * Start the continuous listener
 */
export function startListener(): void {
    if (cache.isRunning) {
        logger.warn("Listener already running");
        return;
    }

    // Clear any existing intervals first
    clearAllIntervals();

    cache.isRunning = true;
    logger.info("🚀 Starting Protocol State Listener...");
    logger.info(`   - Protocol State: every ${PROTOCOL_STATE_INTERVAL / 1000}s`);
    logger.info(`   - Positions: every ${POSITIONS_INTERVAL / 1000}s`);
    logger.info(`   - Vault Types: every ${VAULT_TYPES_INTERVAL / 1000}s`);
    logger.info(`   - Analytics: every ${ANALYTICS_SNAPSHOT_INTERVAL / 1000}s`);
    logger.info(`   - Fee/Liquidation Logs: real-time`);

    // Run initial sync
    fullSync().catch(logger.error);

    // Start Fee Indexer - indexes recent transactions and listens for new ones
    const sdk = getClient();
    const connection = new Connection(CONNECTION_URL, "confirmed");
    const programId = sdk.program.programId;

    // Index historical transactions
    indexRecentTransactions(connection, programId, 200)
        .then(() => logger.info("✅ Historical fee/liquidation logs indexed"))
        .catch((err: Error) => logger.error("Failed to index historical transactions:", err));

    // Start real-time listener for new transactions
    startTransactionListener(connection, programId)
        .then((subId: number) => logger.info(`✅ Real-time fee listener started (subscription: ${subId})`))
        .catch((err: Error) => logger.error("Failed to start fee listener:", err));

    // Protocol State - most frequent (30s)
    const protocolInterval = setInterval(async () => {
        if (!cache.isRunning) return;
        try {
            await syncProtocolState();
            logger.debug("Protocol state synced");
        } catch (e) {
            logger.error("Protocol sync error:", e);
        }
    }, PROTOCOL_STATE_INTERVAL);
    intervalIds.push(protocolInterval);

    // Positions - every minute
    const positionsInterval = setInterval(async () => {
        if (!cache.isRunning) return;
        try {
            await syncPositions();
            logger.debug("Positions synced");
        } catch (e) {
            logger.error("Positions sync error:", e);
        }
    }, POSITIONS_INTERVAL);
    intervalIds.push(positionsInterval);

    // Vault Types - every 2 minutes
    const vaultTypesInterval = setInterval(async () => {
        if (!cache.isRunning) return;
        try {
            await syncVaultTypes();
            logger.debug("Vault types synced");
        } catch (e) {
            logger.error("Vault types sync error:", e);
        }
    }, VAULT_TYPES_INTERVAL);
    intervalIds.push(vaultTypesInterval);

    // Analytics Snapshot - every 5 minutes
    const analyticsInterval = setInterval(async () => {
        if (!cache.isRunning) return;
        try {
            await createAnalyticsSnapshot();
            logger.debug("Analytics snapshot created");
        } catch (e) {
            logger.error("Analytics snapshot error:", e);
        }
    }, ANALYTICS_SNAPSHOT_INTERVAL);
    intervalIds.push(analyticsInterval);

    logger.info(`📊 Started ${intervalIds.length} sync intervals`);
}

/**
 * Clear all running intervals
 */
function clearAllIntervals(): void {
    for (const id of intervalIds) {
        clearInterval(id);
    }
    intervalIds = [];
    logger.debug(`Cleared ${intervalIds.length} intervals`);
}

/**
 * Stop the listener
 */
export function stopListener(): void {
    if (!cache.isRunning) {
        logger.warn("Listener is not running");
        return;
    }

    cache.isRunning = false;
    clearAllIntervals();
    logger.info("🛑 Listener stopped and all intervals cleared");
}

/**
 * Get listener status
 */
export function getListenerStatus() {
    return {
        isRunning: cache.isRunning,
        lastProtocolUpdate: cache.lastProtocolUpdate,
        lastPositionsUpdate: cache.lastPositionsUpdate,
        lastVaultTypesUpdate: cache.lastVaultTypesUpdate,
        lastAnalyticsSnapshot: cache.lastAnalyticsSnapshot,
        timeSinceLastProtocolUpdate: cache.lastProtocolUpdate ? Date.now() - cache.lastProtocolUpdate : null,
        timeSinceLastPositionsUpdate: cache.lastPositionsUpdate ? Date.now() - cache.lastPositionsUpdate : null,
    };
}
