import { Connection, PublicKey } from "@solana/web3.js";

async function checkAccounts() {
    console.log("🔍 Checking all program accounts...\n");

    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const programId = new PublicKey("GUbZCWhik1iMLH43x9maNYVi4X64ncDsrzUBXvDYn9QE");

    try {
        const accounts = await connection.getProgramAccounts(programId);

        console.log(`Found ${accounts.length} total accounts for program\n`);

        accounts.forEach((account, i) => {
            console.log(`${i + 1}. Account: ${account.pubkey.toString()}`);
            console.log(`   Data length: ${account.account.data.length} bytes`);
            console.log(`   Owner: ${account.account.owner.toString()}`);
            console.log(`   First 16 bytes (hex): ${account.account.data.slice(0, 16).toString('hex')}`);
            console.log("");
        });
    } catch (error: any) {
        console.error("❌ Error:", error.message);
    }
}

checkAccounts();
