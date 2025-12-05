import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { AegisClient } from "./src/base-client";

async function testFetchVaultTypes() {
    console.log("🔍 Testing fetchAllVaultTypes...\n");

    // Setup connection
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const programId = new PublicKey("GUbZCWhik1iMLH43x9maNYVi4X64ncDsrzUBXvDYn9QE");

    // Create a dummy wallet (we don't need to sign anything for fetching)
    const wallet = {
        publicKey: PublicKey.default,
        signTransaction: async () => { throw new Error("Not implemented"); },
        signAllTransactions: async () => { throw new Error("Not implemented"); },
    };

    const provider = new anchor.AnchorProvider(
        connection,
        wallet as any,
        { commitment: "confirmed" }
    );

    const client = new AegisClient(provider);

    try {
        console.log("Program ID:", programId.toString());
        console.log("Fetching vault types...\n");

        const vaultTypes = await client.fetchAllVaultTypes();

        console.log("✅ Success!");
        console.log(`Found ${vaultTypes.length} vault types:\n`);

        vaultTypes.forEach((vt, i) => {
            console.log(`${i + 1}. Vault Type:`);
            console.log(`   Address: ${vt.publicKey.toString()}`);
            console.log(`   Collateral Mint: ${vt.account.collateralMint.toString()}`);
            console.log(`   LTV: ${vt.account.ltvBps} bps`);
            console.log(`   Active: ${vt.account.isActive}`);
            console.log("");
        });
    } catch (error: any) {
        console.error("❌ Error:", error.message);
        console.error("\nFull error:", error);
    }
}

testFetchVaultTypes();
