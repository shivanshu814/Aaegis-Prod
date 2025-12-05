import { AnchorProvider } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import { AegisClient } from "../src/base-client";

/**
 * Deployment Checklist Script for Aegis Protocol
 * 
 * This script validates and logs all necessary information for deployment
 * across localnet, devnet, and mainnet.
 */

// Environment configuration
const ENVIRONMENTS = {
    localnet: "http://localhost:8899",
    devnet: "https://api.devnet.solana.com",
    mainnet: "https://api.mainnet-beta.solana.com",
};

async function runDeploymentChecklist(env: "localnet" | "devnet" | "mainnet") {
    console.log("=====================================");
    console.log(`🚀 AEGIS PROTOCOL DEPLOYMENT CHECKLIST`);
    console.log(`📍 Environment: ${env.toUpperCase()}`);
    console.log("=====================================\n");

    const rpcUrl = ENVIRONMENTS[env];
    const connection = new Connection(rpcUrl, "confirmed");

    // Load keypair
    const keypairPath = path.join(process.env.HOME || "", ".config/solana/id.json");
    console.log("📁 Loading keypair from:", keypairPath);

    if (!fs.existsSync(keypairPath)) {
        console.error("❌ Keypair not found!");
        console.log("💡 Generate one with: solana-keygen new");
        process.exit(1);
    }

    const keypairData = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
    const payer = Keypair.fromSecretKey(new Uint8Array(keypairData));
    console.log("✅ Keypair loaded");
    console.log("   Pubkey:", payer.publicKey.toString());

    // Check balance
    const balance = await connection.getBalance(payer.publicKey);
    const solBalance = balance / 1e9;
    console.log(`\n💰 Wallet Balance: ${solBalance} SOL`);

    if (env === "devnet" && solBalance < 1) {
        console.log("⚠️  Low balance! Airdrop with: solana airdrop 2");
    } else if (env === "mainnet" && solBalance < 5) {
        console.log("⚠️  Low balance for mainnet deployment!");
    } else {
        console.log("✅ Sufficient balance");
    }

    // Program ID
    const PROGRAM_ID = new PublicKey("71Wb7tohP36AHMxCoBaSL2osriCnNuxgdRNLyM9FZRu8");
    console.log(`\n📦 Program ID: ${PROGRAM_ID.toString()}`);

    // Check if program exists
    try {
        const programInfo = await connection.getAccountInfo(PROGRAM_ID);
        if (programInfo) {
            console.log("✅ Program deployed");
            console.log("   Owner:", programInfo.owner.toString());
            console.log("   Data size:", programInfo.data.length, "bytes");
        } else {
            console.log("❌ Program not deployed yet");
            console.log("💡 Deploy with: anchor deploy");
        }
    } catch (e) {
        console.log("❌ Cannot verify program deployment");
    }

    // Protocol State PDA
    const [protocolStatePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("protocol_state")],
        PROGRAM_ID
    );
    console.log(`\n🏛️  Protocol State PDA: ${protocolStatePDA.toString()}`);

    try {
        const protocolStateInfo = await connection.getAccountInfo(protocolStatePDA);
        if (protocolStateInfo) {
            console.log("✅ Protocol initialized");

            // Parse basic info
            const stablecoinMint = new PublicKey(protocolStateInfo.data.slice(200, 232));
            const mintAuthorityBump = protocolStateInfo.data[232];

            console.log("   Stablecoin Mint:", stablecoinMint.toString());
            console.log("   Mint Authority Bump:", mintAuthorityBump);

            // Mint authority PDA
            const mintAuthority = PublicKey.createProgramAddressSync(
                [Buffer.from("mint_authority"), Buffer.from([mintAuthorityBump])],
                PROGRAM_ID
            );
            console.log("   Mint Authority PDA:", mintAuthority.toString());

            // Verify mint authority
            const mintInfo = await connection.getParsedAccountInfo(stablecoinMint);
            if (mintInfo.value && "parsed" in mintInfo.value.data) {
                const actualAuthority = mintInfo.value.data.parsed.info.mintAuthority;
                if (actualAuthority === mintAuthority.toString()) {
                    console.log("   ✅ Mint authority is correct");
                } else {
                    console.log("   ❌ Mint authority mismatch!");
                    console.log("      Expected:", mintAuthority.toString());
                    console.log("      Actual:", actualAuthority);
                    console.log("   💡 Fix with: npx ts-node scripts/fix-mint-authority.ts");
                }
            }
        } else {
            console.log("❌ Protocol not initialized");
            console.log("💡 Initialize with: npx ts-node scripts/initialize-protocol.ts");
        }
    } catch (e: any) {
        console.log("❌ Cannot check protocol state:", e.message);
    }

    // Check vault types
    console.log("\n📊 Checking Vault Types...");
    try {
        const provider = new AnchorProvider(connection, { publicKey: payer.publicKey, signTransaction: async () => { throw new Error("Not implemented"); }, signAllTransactions: async () => { throw new Error("Not implemented"); } } as any, {});
        const client = new AegisClient(provider);

        const vaults = await client.fetchAllVaultTypes();
        console.log(`✅ Found ${vaults.length} vault type(s)`);

        vaults.forEach((vault, idx) => {
            console.log(`\n   Vault ${idx + 1}:`);
            console.log(`   - Address: ${vault.publicKey.toString()}`);
            console.log(`   - Collateral Mint: ${vault.account.collateralMint.toString()}`);
            console.log(`   - Oracle: ${vault.account.oraclePriceAccount.toString()}`);
            console.log(`   - LTV: ${vault.account.ltvBps / 100}%`);
            console.log(`   - Liq Threshold: ${vault.account.liqThresholdBps / 100}%`);
            console.log(`   - Active: ${vault.account.isActive ? "✅" : "❌"}`);
        });
    } catch (e: any) {
        console.log("❌ Cannot fetch vault types:", e.message);
    }

    // Deployment summary
    console.log("\n=====================================");
    console.log("📋 DEPLOYMENT SUMMARY");
    console.log("=====================================");
    console.log(`Environment: ${env.toUpperCase()}`);
    console.log(`RPC URL: ${rpcUrl}`);
    console.log(`Deployer: ${payer.publicKey.toString()}`);
    console.log(`Balance: ${solBalance} SOL`);
    console.log(`Program ID: ${PROGRAM_ID.toString()}`);
    console.log(`Protocol State: ${protocolStatePDA.toString()}`);
    console.log("=====================================\n");

    // Next steps
    console.log("📝 NEXT STEPS:");
    console.log("1. Ensure program is deployed: anchor deploy");
    console.log("2. Initialize protocol: npx ts-node scripts/initialize-protocol.ts");
    console.log("3. Set stablecoin mint: Use admin app or SDK");
    console.log("4. Create vault types: Use admin app or SDK");
    console.log("5. Verify mint authority: npx ts-node scripts/fix-mint-authority.ts");
    console.log("6. Test operations: deposit, mint, repay, withdraw");
    console.log("\n✨ Deployment checklist complete!\n");
}

// Parse command line arguments
const env = (process.argv[2] as "localnet" | "devnet" | "mainnet") || "devnet";

if (!["localnet", "devnet", "mainnet"].includes(env)) {
    console.error("Usage: npx ts-node scripts/deploy-checklist.ts [localnet|devnet|mainnet]");
    process.exit(1);
}

runDeploymentChecklist(env).catch(console.error);
