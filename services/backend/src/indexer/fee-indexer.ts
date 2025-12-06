import { AegisClient } from "@aegis/sdk";
import { AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { connectDB } from "../db";
import { FeeLog } from "../models/FeeLog";
import { LiquidationLog } from "../models/LiquidationLog";
import { logger } from "../utils/logger";

const CONNECTION_URL = process.env.CONNECTION_URL || "https://api.devnet.solana.com";

interface FeeEvent {
    type: 'mint' | 'redeem' | 'stability' | 'liquidation';
    amount: number;
    userPubkey: string;
    vaultType: string;
    txSignature: string;
    timestamp: number;
}

interface LiquidationEvent {
    liquidatorPubkey: string;
    positionOwner: string;
    positionPubkey: string;
    vaultType: string;
    debtRepaid: number;
    collateralSeized: number;
    penaltyFee: number;
    collateralPrice: number;
    txSignature: string;
    timestamp: number;
    healthFactorBefore: number;
}

// Parse program logs to extract fee events
function parseFeeFromLogs(logs: string[], signature: string, timestamp: number): FeeEvent | null {
    for (const log of logs) {
        // Look for mint fee logs
        if (log.includes("MintFeeCollected")) {
            const match = log.match(/MintFeeCollected.*amount=(\d+).*user=(\w+).*vault=(\w+)/);
            if (match) {
                return {
                    type: 'mint',
                    amount: parseInt(match[1]),
                    userPubkey: match[2],
                    vaultType: match[3],
                    txSignature: signature,
                    timestamp,
                };
            }
        }

        // Look for redeem fee logs
        if (log.includes("RedeemFeeCollected")) {
            const match = log.match(/RedeemFeeCollected.*amount=(\d+).*user=(\w+).*vault=(\w+)/);
            if (match) {
                return {
                    type: 'redeem',
                    amount: parseInt(match[1]),
                    userPubkey: match[2],
                    vaultType: match[3],
                    txSignature: signature,
                    timestamp,
                };
            }
        }

        // Look for stability fee logs
        if (log.includes("StabilityFeeCollected")) {
            const match = log.match(/StabilityFeeCollected.*amount=(\d+).*user=(\w+).*vault=(\w+)/);
            if (match) {
                return {
                    type: 'stability',
                    amount: parseInt(match[1]),
                    userPubkey: match[2],
                    vaultType: match[3],
                    txSignature: signature,
                    timestamp,
                };
            }
        }

        // Look for liquidation penalty logs
        if (log.includes("LiquidationPenaltyCollected")) {
            const match = log.match(/LiquidationPenaltyCollected.*amount=(\d+).*user=(\w+).*vault=(\w+)/);
            if (match) {
                return {
                    type: 'liquidation',
                    amount: parseInt(match[1]),
                    userPubkey: match[2],
                    vaultType: match[3],
                    txSignature: signature,
                    timestamp,
                };
            }
        }
    }
    return null;
}

// Parse program logs to extract liquidation events
function parseLiquidationFromLogs(logs: string[], signature: string, timestamp: number): LiquidationEvent | null {
    for (const log of logs) {
        if (log.includes("PositionLiquidated")) {
            // Try to parse structured log
            const match = log.match(
                /PositionLiquidated.*liquidator=(\w+).*owner=(\w+).*position=(\w+).*vault=(\w+).*debt=(\d+).*collateral=(\d+).*penalty=(\d+).*price=(\d+).*health=(\d+\.?\d*)/
            );
            if (match) {
                return {
                    liquidatorPubkey: match[1],
                    positionOwner: match[2],
                    positionPubkey: match[3],
                    vaultType: match[4],
                    debtRepaid: parseInt(match[5]),
                    collateralSeized: parseInt(match[6]),
                    penaltyFee: parseInt(match[7]),
                    collateralPrice: parseInt(match[8]),
                    txSignature: signature,
                    timestamp,
                    healthFactorBefore: parseFloat(match[9]),
                };
            }
        }
    }
    return null;
}

export async function processTransaction(
    connection: Connection,
    signature: string,
    programId: PublicKey
): Promise<void> {
    try {
        const tx = await connection.getParsedTransaction(signature, {
            maxSupportedTransactionVersion: 0,
        });

        if (!tx || !tx.meta?.logMessages) return;

        const timestamp = (tx.blockTime || Math.floor(Date.now() / 1000)) * 1000;
        const logs = tx.meta.logMessages;

        // Parse fee event
        const feeEvent = parseFeeFromLogs(logs, signature, timestamp);
        if (feeEvent) {
            await FeeLog.findOneAndUpdate(
                { txSignature: signature },
                feeEvent,
                { upsert: true }
            );
            logger.info(`Indexed fee: ${feeEvent.type} - ${feeEvent.amount} from ${feeEvent.userPubkey}`);
        }

        // Parse liquidation event
        const liqEvent = parseLiquidationFromLogs(logs, signature, timestamp);
        if (liqEvent) {
            await LiquidationLog.findOneAndUpdate(
                { txSignature: signature },
                liqEvent,
                { upsert: true }
            );
            logger.info(`Indexed liquidation: ${liqEvent.positionOwner} - debt ${liqEvent.debtRepaid}`);
        }
    } catch (error) {
        logger.error(`Error processing transaction ${signature}:`, error);
    }
}

// Fetch recent transactions for the program and index them
export async function indexRecentTransactions(
    connection: Connection,
    programId: PublicKey,
    limit: number = 100
): Promise<void> {
    try {
        logger.info(`Fetching last ${limit} transactions for program ${programId.toBase58()}`);

        const signatures = await connection.getSignaturesForAddress(programId, { limit });

        for (const sig of signatures) {
            // Check if already indexed
            const exists = await FeeLog.findOne({ txSignature: sig.signature });
            if (exists) continue;

            await processTransaction(connection, sig.signature, programId);

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        logger.info(`Indexed ${signatures.length} transactions`);
    } catch (error) {
        logger.error("Error indexing recent transactions:", error);
    }
}

// Start real-time transaction listener
export async function startTransactionListener(
    connection: Connection,
    programId: PublicKey
): Promise<number> {
    logger.info(`Starting real-time transaction listener for ${programId.toBase58()}`);

    const subscriptionId = connection.onLogs(
        programId,
        async (logs, ctx) => {
            if (logs.err) return;

            const timestamp = Date.now();
            const signature = logs.signature;

            // Parse fee event
            const feeEvent = parseFeeFromLogs(logs.logs, signature, timestamp);
            if (feeEvent) {
                await FeeLog.findOneAndUpdate(
                    { txSignature: signature },
                    feeEvent,
                    { upsert: true }
                );
                logger.info(`[LIVE] Fee: ${feeEvent.type} - ${feeEvent.amount}`);
            }

            // Parse liquidation event  
            const liqEvent = parseLiquidationFromLogs(logs.logs, signature, timestamp);
            if (liqEvent) {
                await LiquidationLog.findOneAndUpdate(
                    { txSignature: signature },
                    liqEvent,
                    { upsert: true }
                );
                logger.info(`[LIVE] Liquidation: ${liqEvent.positionOwner}`);
            }
        },
        "confirmed"
    );

    return subscriptionId;
}

// Main function to run the fee indexer
export async function runFeeIndexer() {
    await connectDB();

    const connection = new Connection(CONNECTION_URL, "confirmed");

    // Create read-only provider to get program ID
    const provider = new AnchorProvider(
        connection,
        { publicKey: PublicKey.default, signTransaction: async (tx) => tx, signAllTransactions: async (txs) => txs },
        { commitment: "confirmed" }
    );

    const client = new AegisClient(provider);
    const programId = client.program.programId;

    // 1. Index historical transactions
    await indexRecentTransactions(connection, programId, 500);

    // 2. Start real-time listener
    const subscriptionId = await startTransactionListener(connection, programId);

    logger.info(`Fee indexer running. Subscription ID: ${subscriptionId}`);

    // Keep process alive
    process.on('SIGINT', () => {
        connection.removeOnLogsListener(subscriptionId);
        logger.info("Fee indexer stopped.");
        process.exit(0);
    });
}

// If run directly
if (require.main === module) {
    runFeeIndexer();
}
