import { AuthorityType, setAuthority } from "@solana/spl-token";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

/**
 * Script to fix the mint authority mismatch
 * 
 * This transfers the stablecoin mint authority from the current (wrong) authority
 * to the correct PDA that the protocol expects.
 */

async function fixMintAuthority() {
    // Configuration
    const DEVNET_RPC = "https://api.devnet.solana.com";
    const PROGRAM_ID = new PublicKey("71Wb7tohP36AHMxCoBaSL2osriCnNuxgdRNLyM9FZRu8");

    // Connect
    const connection = new Connection(DEVNET_RPC, "confirmed");

    // Load keypair - this should be the admin/payer keypair
    const keypairPath = path.join(process.env.HOME || "", ".config/solana/id.json");
    console.log("Loading keypair from:", keypairPath);

    if (!fs.existsSync(keypairPath)) {
        throw new Error(`Keypair not found at ${keypairPath}. Please specify the path to your keypair.`);
    }

    const keypairData = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
    const payer = Keypair.fromSecretKey(new Uint8Array(keypairData));
    console.log("Payer pubkey:", payer.publicKey.toString());

    // Get protocol state PDA
    const [protocolStatePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("protocol_state")],
        PROGRAM_ID
    );
    console.log("Protocol State PDA:", protocolStatePDA.toString());

    // Fetch protocol state to get stablecoin mint and expected bump
    const protocolStateInfo = await connection.getAccountInfo(protocolStatePDA);
    if (!protocolStateInfo) {
        throw new Error("Protocol state not found!");
    }

    // Parse protocol state (simplified - just get the stablecoin mint)
    // The stablecoin_mint is at offset 8 (discriminator) + 32*6 (6 pubkeys) = 200
    const stablecoinMint = new PublicKey(protocolStateInfo.data.slice(200, 232));
    const mintAuthorityBump = protocolStateInfo.data[232]; // Next byte after stablecoin_mint

    console.log("Stablecoin Mint:", stablecoinMint.toString());
    console.log("Expected Bump:", mintAuthorityBump);

    if (mintAuthorityBump === undefined) {
        throw new Error("Could not read mint authority bump from protocol state");
    }

    // Derive the correct mint authority PDA
    const correctMintAuthority = PublicKey.createProgramAddressSync(
        [Buffer.from("mint_authority"), Buffer.from([mintAuthorityBump])],
        PROGRAM_ID
    );
    console.log("Correct Mint Authority PDA:", correctMintAuthority.toString());

    // Check current mint authority
    const mintInfo = await connection.getParsedAccountInfo(stablecoinMint);
    if (!mintInfo.value || !("parsed" in mintInfo.value.data)) {
        throw new Error("Could not fetch mint info");
    }

    const currentAuthority = mintInfo.value.data.parsed.info.mintAuthority;
    console.log("Current Mint Authority:", currentAuthority);

    if (currentAuthority === correctMintAuthority.toString()) {
        console.log("✅ Mint authority is already correct!");
        return;
    }

    console.log("\n🔧 Transferring mint authority...");
    console.log(`From: ${currentAuthority}`);
    console.log(`To: ${correctMintAuthority.toString()}`);

    // The current authority might be the payer or another account
    // We'll assume the payer is the current authority (or has signed for it)
    const currentAuthorityPubkey = new PublicKey(currentAuthority);

    try {
        // Attempt to set authority
        const signature = await setAuthority(
            connection,
            payer, // payer
            stablecoinMint, // mint
            payer, // current authority (assuming payer is the current authority)
            AuthorityType.MintTokens, // authority type
            correctMintAuthority // new authority
        );

        console.log("✅ Authority transferred!");
        console.log("Transaction signature:", signature);
        console.log("Explorer:", `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    } catch (error: any) {
        console.error("❌ Failed to transfer authority:", error.message);
        console.error("\nThe current authority might be a different keypair.");
        console.error("Current authority:", currentAuthority);
        console.error("You may need to use that keypair to sign the transaction.");
        throw error;
    }
}

fixMintAuthority().catch(console.error);
