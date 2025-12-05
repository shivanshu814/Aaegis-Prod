import * as anchor from "@coral-xyz/anchor";
import { AuthorityType, createMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority } from "@solana/spl-token";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import { AegisClient } from "../src";

// Constants
const CONNECTION_URL = "https://api.devnet.solana.com";
const SOL_USD_ORACLE = new PublicKey("7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE"); // Pyth SOL/USD Devnet

async function main() {
    console.log("🚀 Starting Full Flow Test on Devnet...");

    // Setup connection and wallet
    const connection = new Connection(CONNECTION_URL, "confirmed");
    const walletKeypair = Keypair.fromSecretKey(
        Buffer.from(JSON.parse(fs.readFileSync(os.homedir() + "/.config/solana/id.json", "utf-8")))
    );
    const wallet = new anchor.Wallet(walletKeypair);
    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
    anchor.setProvider(provider);

    const client = new AegisClient(provider);

    console.log(`Wallet: ${wallet.publicKey.toBase58()}`);
    const balance = await connection.getBalance(wallet.publicKey);
    console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    if (balance < 0.1 * LAMPORTS_PER_SOL) {
        console.error("Insufficient SOL. Please airdrop.");
        return;
    }

    // 1. Initialize Protocol
    console.log("\n1. Initializing Protocol...");
    let protocolState;
    try {
        protocolState = await client.fetchProtocolState();
        console.log("Protocol already initialized.");
    } catch (e) {
        console.log("Initializing protocol...");
        await client.initializeProtocol(wallet.publicKey);
        console.log("Protocol initialized.");
        protocolState = await client.fetchProtocolState();
    }

    // 2. Setup Stablecoin Mint
    console.log("\n2. Setting up Stablecoin Mint...");
    let stablecoinMint = protocolState.stablecoinMint;

    if (stablecoinMint.equals(PublicKey.default)) {
        console.log("Creating stablecoin mint...");
        stablecoinMint = await createMint(
            connection,
            walletKeypair,
            wallet.publicKey,
            null,
            6
        );
        console.log(`Stablecoin Mint: ${stablecoinMint.toBase58()}`);

        const tx = await client.setStablecoinMint(stablecoinMint);
        console.log(`Stablecoin mint set in protocol. TX: ${tx}`);

        // Transfer mint authority to protocol PDA
        const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("mint_authority")],
            client.program.programId
        );

        console.log(`Transferring mint authority to ${mintAuthorityPda.toBase58()}...`);
        await setAuthority(
            connection,
            walletKeypair,
            stablecoinMint,
            wallet.publicKey,
            AuthorityType.MintTokens,
            mintAuthorityPda
        );
        console.log("Mint authority transferred.");
    } else {
        console.log(`Stablecoin Mint already set: ${stablecoinMint.toBase58()}`);
    }

    // 3. Create Vault Type (wSOL)
    console.log("\n3. Creating Vault Type (wSOL)...");
    // We'll use a new mint for "wSOL" to avoid wrapping issues for now, or just use native SOL wrapping if we want.
    // Let's create a dummy collateral mint to represent wSOL for simplicity in minting.
    // In real app, we use actual wSOL mint.
    // Let's create a new mint for testing.
    const collateralMint = await createMint(
        connection,
        walletKeypair,
        wallet.publicKey,
        null,
        9
    );
    console.log(`Collateral Mint: ${collateralMint.toBase58()}`);

    // Check if vault type exists for this mint
    // Since we just created it, it doesn't.
    console.log("Creating Vault Type...");
    try {
        const tx = await client.createVaultType(
            collateralMint,
            {
                oraclePubkey: SOL_USD_ORACLE,
                ltvBps: 15000, // 150% LTV
                liqThresholdBps: 12000, // 120% Liq Threshold
                liqPenaltyBps: 500,   // 5% Penalty
                stabilityFeeBps: 100,   // 1% Stability Fee
                mintFeeBps: 50,    // 0.5% Mint Fee
                redeemFeeBps: 0,
                vaultDebtCeiling: 1000000000 // Max Debt
            }
        );
        console.log(`Vault Type created. TX: ${tx}`);
    } catch (e) {
        console.log("Vault Type might already exist or error:", e);
    }

    // 4. User Flow
    console.log("\n4. Executing User Flow...");

    // Mint some collateral to user
    console.log("Minting collateral to user...");
    const userCollateralAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        walletKeypair,
        collateralMint,
        wallet.publicKey
    );
    await mintTo(
        connection,
        walletKeypair,
        collateralMint,
        userCollateralAccount.address,
        wallet.publicKey,
        10 * LAMPORTS_PER_SOL // 10 tokens
    );
    console.log("Minted 10 collateral tokens.");

    // Open Position
    console.log("Opening Position...");
    const [vaultTypePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault-type"), collateralMint.toBuffer()],
        client.program.programId
    );

    try {
        const tx = await client.openPosition(vaultTypePda);
        console.log(`Position opened. TX: ${tx}`);
    } catch (e) {
        console.log("Position might already exist.");
    }

    // Create Vault Collateral ATA
    console.log("Creating Vault Collateral ATA...");
    const [vaultAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault_authority"), vaultTypePda.toBuffer()],
        client.program.programId
    );
    const vaultCollateralAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        walletKeypair,
        collateralMint,
        vaultAuthority,
        true
    );
    console.log(`Vault Collateral Account: ${vaultCollateralAccount.address.toBase58()}`);

    // Deposit Collateral
    console.log("Depositing Collateral...");
    try {
        const tx = await client.depositCollateral(
            vaultTypePda,
            1 * LAMPORTS_PER_SOL, // 1 token
            collateralMint
        );
        console.log(`Deposited 1 collateral. TX: ${tx}`);
    } catch (e) {
        console.error("Deposit failed:", e);
    }

    // Mint Stablecoin
    console.log("Minting Stablecoin...");
    try {
        // Price is roughly $20-150. Let's mint 10 units (assuming $10 value).
        const tx = await client.mintStablecoin(
            vaultTypePda,
            10 * 1_000_000 // 10.000000
        );
        console.log(`Minted 10 AGSUSD. TX: ${tx}`);
    } catch (e) {
        console.error("Mint failed:", e);
    }

    // Repay Stablecoin
    console.log("Repaying Stablecoin...");
    try {
        const tx = await client.repayStablecoin(
            vaultTypePda,
            5 * 1_000_000 // 5.000000
        );
        console.log(`Repaid 5 AGSUSD. TX: ${tx}`);
    } catch (e) {
        console.error("Repay failed:", e);
    }

    // Withdraw Collateral
    console.log("Withdrawing Collateral...");
    try {
        const pos = await client.fetchPosition(vaultTypePda);
        console.log(`Position Collateral: ${pos.collateralAmount.toString()}`);
        console.log(`Position Debt: ${pos.debtAmount.toString()}`);

        const tx = await client.withdrawCollateral(
            vaultTypePda,
            0.1 * LAMPORTS_PER_SOL, // 0.1 token
            collateralMint
        );
        console.log(`Withdrew 0.1 collateral. TX: ${tx}`);
    } catch (e) {
        console.error("Withdraw failed:", e);
    }

    console.log("\n✅ Full Flow Test Completed!");
}

main().then(() => console.log("Done")).catch(console.error);
