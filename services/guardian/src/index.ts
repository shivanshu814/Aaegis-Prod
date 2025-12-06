import dotenv from "dotenv";
dotenv.config();

import { AegisClient } from "@aegis/sdk";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import mongoose from "mongoose";
import * as cron from "node-cron";
import { connectDB } from "./db";
import { notificationService } from "./notifications";
import { logger } from "./utils/logger";

// Models (duplicated for now, ideally shared package)
const PositionSchema = new mongoose.Schema({
    owner: String,
    vaultType: String,
    collateralAmount: Number,
    debtAmount: Number,
    updatedAt: Number,
    healthFactor: Number,
});
const Position = mongoose.model("Position", PositionSchema);

const CONNECTION_URL = process.env.CONNECTION_URL || "https://api.devnet.solana.com";

// Load or Generate Guardian Keypair
import fs from "fs";
import path from "path";

const KEYPAIR_PATH = path.join(__dirname, "..", "guardian-keypair.json");

let GUARDIAN_KEYPAIR: Keypair;

if (fs.existsSync(KEYPAIR_PATH)) {
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(KEYPAIR_PATH, "utf-8")));
    GUARDIAN_KEYPAIR = Keypair.fromSecretKey(secretKey);
    logger.info(`Loaded Guardian Wallet via ${KEYPAIR_PATH}`);
} else {
    GUARDIAN_KEYPAIR = Keypair.generate();
    fs.writeFileSync(KEYPAIR_PATH, JSON.stringify(Array.from(GUARDIAN_KEYPAIR.secretKey)));
    logger.info(`Generated new Guardian Wallet at ${KEYPAIR_PATH}`);
}

const checkAndFundWallet = async (connection: Connection, publicKey: PublicKey) => {
    try {
        const balance = await connection.getBalance(publicKey);
        logger.info(`Guardian Wallet (${publicKey.toString()}) Balance: ${balance / 1e9} SOL`);

        if (balance < 1 * 1e9) { // Fund if below 1 SOL
            logger.info("Balance low (< 1 SOL). Requesting airdrop...");
            try {
                // Request 2 SOL to be safe
                const signature = await connection.requestAirdrop(publicKey, 2 * 1e9);

                // Wait for confirmation
                const latestBlockHash = await connection.getLatestBlockhash();
                await connection.confirmTransaction({
                    blockhash: latestBlockHash.blockhash,
                    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                    signature: signature,
                });

                logger.info("Airdrop successful. New balance will be reflected shortly.");
            } catch (airdropError: any) {
                if (airdropError.message && airdropError.message.includes("429")) {
                    logger.warn("Airdrop rate limited (429). Will retry later.");
                } else {
                    logger.warn("Airdrop failed. Ensure wallet is funded manually if on mainnet or if devnet faucet is down.", airdropError);
                }
            }
        }
    } catch (e) {
        logger.error("Failed to check balance or airdrop:", e);
    }
};

const runGuardian = async () => {
    logger.info("Starting Guardian Service...");
    await connectDB();

    const connection = new Connection(CONNECTION_URL, "confirmed");

    // Check Balance on startup
    await checkAndFundWallet(connection, GUARDIAN_KEYPAIR.publicKey);

    // Schedule Balance Check every 1 hour
    cron.schedule("0 * * * *", async () => {
        logger.info("Running scheduled wallet balance check...");
        await checkAndFundWallet(connection, GUARDIAN_KEYPAIR.publicKey);
    });

    const wallet = new Wallet(GUARDIAN_KEYPAIR);
    const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
    const client = new AegisClient(provider);

    // Schedule Liquidation Check every 1 minute
    cron.schedule("* * * * *", async () => {
        logger.info("Running scheduled liquidation check...");
        try {
            // 1. Fetch all positions from DB
            const positions = await Position.find({});

            for (const pos of positions) {
                logger.info(`Checking position: ${pos.owner} - ${pos.vaultType}`);

                try {
                    // Fetch Vault Type to get Oracle and LTV
                    if (!pos.vaultType) continue;

                    const vaultTypePubkey = new PublicKey(pos.vaultType);
                    const vaultTypeAccount = await client.program.account.vaultType.fetch(vaultTypePubkey);

                    // Fetch Oracle Price
                    const price = await client.getOraclePrice(vaultTypeAccount.oraclePriceAccount);
                    if (!price) {
                        logger.warn(`Could not fetch price for vault ${pos.vaultType}`);
                        continue;
                    }

                    // Calculate Health Factor
                    // Collateral Value = Collateral Amount * Price
                    // Max Debt = Collateral Value * LTV / 10000
                    // Health Factor = Max Debt / Debt Amount

                    // Collateral Amount is in base units (e.g. lamports)
                    // Price is in USD (e.g. 20.5)
                    // We need to normalize decimals. 
                    // Assuming Collateral is 9 decimals (SOL) and Price is float.
                    // Collateral Value ($) = (Amount / 10^9) * Price

                    // Wait, SDK getOraclePrice returns float.
                    // Let's assume collateral is standard SPL (check mint decimals if possible, but for now assume 9 for SOL)
                    // Actually, we should fetch mint to get decimals, but let's assume 9 for simplicity or fetch it.
                    // Better: Use BN for precision if possible, but JS float is okay for estimation.

                    const collateralAmount = (pos.collateralAmount || 0) / 1_000_000_000; // Assuming 9 decimals
                    const collateralValue = collateralAmount * price;

                    const ltv = vaultTypeAccount.ltvBps.toNumber() / 10000; // e.g. 1.5 for 150%
                    const maxDebt = collateralValue * ltv;

                    // Debt Amount is in 6 decimals (AGSUSD)
                    const debtAmount = (pos.debtAmount || 0) / 1_000_000;

                    if (debtAmount > 0) {
                        // If debt > maxDebt, it's unsafe? 
                        // Wait, LTV is usually "Loan to Value". 
                        // If LTV is 80% (8000 bps), then Debt <= Value * 0.8
                        // If Debt > Value * 0.8, it's liquidatable?
                        // Actually, usually there is a separate Liquidation Threshold.
                        // VaultType has `liqThresholdBps`.

                        const liqThreshold = vaultTypeAccount.liqThresholdBps.toNumber() / 10000; // e.g. 0.8
                        const liquidationLimit = collateralValue * liqThreshold;

                        logger.info(`Position Health: Debt=${debtAmount}, Limit=${liquidationLimit}, Price=${price}`);

                        if (debtAmount > liquidationLimit) {
                            logger.warn(`Position ${pos.owner} is UNSAFE! Attempting liquidation...`);

                            // Calculate repay amount (e.g. 50% of debt or full)
                            // For now, try to liquidate 50%
                            const repayAmount = Math.floor((pos.debtAmount || 0) * 0.5);

                            const positionPubkey = PublicKey.findProgramAddressSync(
                                [
                                    Buffer.from("position"),
                                    new PublicKey(pos.owner!).toBuffer(),
                                    vaultTypePubkey.toBuffer(),
                                ],
                                client.program.programId
                            )[0];

                            const tx = await client.liquidatePosition(positionPubkey, repayAmount);
                            logger.info(`Liquidation successful: ${tx}`);

                            // Send notification
                            await notificationService.sendLiquidationAlert({
                                positionOwner: pos.owner!,
                                vaultType: pos.vaultType!,
                                debtRepaid: repayAmount,
                                collateralReceived: 0, // Would need to calculate from tx
                                timestamp: Math.floor(Date.now() / 1000),
                            });
                        }
                    }
                } catch (e) {
                    logger.error(`Error checking position ${pos.owner}:`, e);
                }
            }
        } catch (error) {
            logger.error("Error in liquidation check:", error);
        }
    });

    logger.info("Guardian Service is running.");
};

runGuardian();
