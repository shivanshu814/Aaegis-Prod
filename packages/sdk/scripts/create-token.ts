import {
    createCreateMetadataAccountV3Instruction,
    PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import {
    createMint,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
    Transaction,
} from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

/**
 * Creates a stablecoin mint for Aegis Protocol
 * - Decimals: 6
 * - Mint authority: Protocol PDA (will be set later)
 * - Freeze authority: Protocol PDA
 */
export async function createStablecoinMint(
    connection: Connection,
    payer: Keypair,
    mintAuthority: PublicKey,
    freezeAuthority: PublicKey,
    programId: PublicKey
): Promise<PublicKey> {
    console.log("Creating AGSUSD stablecoin mint...");

    // Create the mint
    const mint = await createMint(
        connection,
        payer,
        mintAuthority,
        freezeAuthority,
        6, // decimals
        undefined,
        undefined,
        TOKEN_PROGRAM_ID
    );

    console.log("✅ Mint created:", mint.toString());

    // Create metadata
    const metadataPath = path.join(__dirname, "../metadata/agsusd-metadata.json");
    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));

    const metadataPDA = PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
        ],
        METADATA_PROGRAM_ID
    )[0];

    const createMetadataIx = createCreateMetadataAccountV3Instruction(
        {
            metadata: metadataPDA,
            mint: mint,
            mintAuthority: payer.publicKey,
            payer: payer.publicKey,
            updateAuthority: payer.publicKey,
        },
        {
            createMetadataAccountArgsV3: {
                data: {
                    name: metadata.name,
                    symbol: metadata.symbol,
                    uri: "", // Host metadata JSON and put URI here
                    sellerFeeBasisPoints: 0,
                    creators: null,
                    collection: null,
                    uses: null,
                },
                isMutable: true,
                collectionDetails: null,
            },
        }
    );

    const tx = new Transaction().add(createMetadataIx);
    const sig = await sendAndConfirmTransaction(connection, tx, [payer]);

    console.log("✅ Metadata created:", sig);
    console.log("✅ Metadata PDA:", metadataPDA.toString());

    return mint;
}

/**
 * Creates the AGS governance token
 * - Decimals: 9
 * - Mint authority: Admin wallet
 * - Freeze authority: Admin wallet
 */
export async function createGovernanceToken(
    connection: Connection,
    payer: Keypair,
    mintAuthority: PublicKey,
    freezeAuthority: PublicKey
): Promise<PublicKey> {
    console.log("Creating AGS governance token...");

    // Create the mint
    const mint = await createMint(
        connection,
        payer,
        mintAuthority,
        freezeAuthority,
        9, // decimals
        undefined,
        undefined,
        TOKEN_PROGRAM_ID
    );

    console.log("✅ Mint created:", mint.toString());

    // Create metadata
    const metadataPath = path.join(__dirname, "../metadata/ags-metadata.json");
    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));

    const metadataPDA = PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
        ],
        METADATA_PROGRAM_ID
    )[0];

    const createMetadataIx = createCreateMetadataAccountV3Instruction(
        {
            metadata: metadataPDA,
            mint: mint,
            mintAuthority: payer.publicKey,
            payer: payer.publicKey,
            updateAuthority: payer.publicKey,
        },
        {
            createMetadataAccountArgsV3: {
                data: {
                    name: metadata.name,
                    symbol: metadata.symbol,
                    uri: "", // Host metadata JSON and put URI here
                    sellerFeeBasisPoints: 0,
                    creators: null,
                    collection: null,
                    uses: null,
                },
                isMutable: true,
                collectionDetails: null,
            },
        }
    );

    const tx = new Transaction().add(createMetadataIx);
    const sig = await sendAndConfirmTransaction(connection, tx, [payer]);

    console.log("✅ Metadata created:", sig);
    console.log("✅ Metadata PDA:", metadataPDA.toString());

    return mint;
}

// CLI execution
async function main() {
    const args = process.argv.slice(2);
    const tokenType = args[0]; // 'stablecoin' or 'governance'

    if (!tokenType || !["stablecoin", "governance"].includes(tokenType)) {
        console.error("Usage: ts-node create-token.ts <stablecoin|governance>");
        process.exit(1);
    }

    // Note: In production, load from env or secure location
    const connection = new Connection("https://api.devnet.solana.com");
    const payerKeypair = Keypair.generate(); // Replace with actual payer

    console.log("Payer:", payerKeypair.publicKey.toString());
    console.log("Request airdrop first!");

    // For demo purposes
    console.log("\nTo create tokens:");
    console.log("1. Fund the payer wallet");
    console.log("2. Run this script with your actual keypair");
    console.log("3. Save the mint address to your env/config");
}

if (require.main === module) {
    main().catch(console.error);
}
