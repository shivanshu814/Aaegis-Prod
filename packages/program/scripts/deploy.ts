import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "../utils";

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get environment from args
const env = process.argv[2];
if (!env || !["localnet", "devnet", "mainnet"].includes(env)) {
  logger.error("❌ Invalid environment specified");
  logger.info("Usage: tsx scripts/deploy.ts <environment>");
  logger.info("Environments: localnet, devnet, mainnet");
  process.exit(1);
}

const runCommand = (command: string, silent = false) => {
  try {
    const output = execSync(command, {
      stdio: silent ? "pipe" : "inherit",
      encoding: "utf-8"
    });
    return output;
  } catch (error) {
    logger.error(`❌ Command failed: ${command}`);
    process.exit(1);
  }
};

// Print banner
console.log("\n" + "=".repeat(60));
console.log("🚀 AEGIS PROTOCOL DEPLOYMENT");
console.log("=".repeat(60));
console.log(`📍 Environment: ${env.toUpperCase()}`);
console.log(`⏰ Time: ${new Date().toLocaleString()}`);
console.log("=".repeat(60) + "\n");

// Step 1: Check Solana CLI
logger.info("🔍 Step 1: Checking Solana CLI...");
try {
  const solanaVersion = runCommand("solana --version", true)?.trim();
  logger.info(`✅ Solana CLI: ${solanaVersion}`);
} catch {
  logger.error("❌ Solana CLI not found. Install with: sh -c \"$(curl -sSfL https://release.solana.com/stable/install)\"");
  process.exit(1);
}

// Step 2: Check current cluster
logger.info("\n🔍 Step 2: Verifying cluster configuration...");
const currentCluster = runCommand("solana config get", true);
logger.info(`Current config:\n${currentCluster}`);

// Step 3: Check wallet balance
logger.info("\n💰 Step 3: Checking wallet balance...");
const address = runCommand("solana address", true)?.trim();
logger.info(`Deployer address: ${address}`);

const balance = runCommand("solana balance", true)?.trim();
logger.info(`Balance: ${balance}`);

const balanceNum = parseFloat(balance?.split(" ")[0] || "0");
if (env === "devnet" && balanceNum < 2) {
  logger.warn("⚠️  Low balance detected!");
  logger.info("💡 Get devnet SOL: solana airdrop 2");
} else if (env === "mainnet" && balanceNum < 5) {
  logger.error("❌ Insufficient balance for mainnet deployment (minimum 5 SOL recommended)");
  process.exit(1);
}

// Step 4: Build the program
logger.info("\n🔨 Step 4: Building program...");
runCommand("anchor build");
logger.info("✅ Build complete");

// Step 5: Get Program ID
logger.info("\n📦 Step 5: Reading Program ID...");
const programKeypairPath = path.resolve(__dirname, "../target/deploy/aegis_vault-keypair.json");
if (!fs.existsSync(programKeypairPath)) {
  logger.error(`❌ Program keypair not found at ${programKeypairPath}`);
  process.exit(1);
}

const programId = runCommand(`solana-keygen pubkey ${programKeypairPath}`, true)?.trim();
logger.info(`Program ID: ${programId}`);

// Step 6: Deploy the program
logger.info(`\n🚀 Step 6: Deploying program to ${env}...`);
logger.info("This may take a few minutes...");

const clusterFlag = env === "localnet" ? "localnet" : env;
runCommand(`anchor deploy --provider.cluster ${clusterFlag}`);

logger.info("✅ Program deployed successfully!");

// Step 7: Verify deployment
logger.info("\n✅ Step 7: Verifying deployment...");
try {
  const programInfo = runCommand(`solana program show ${programId}`, true);
  logger.info("Program info:");
  console.log(programInfo);
} catch (e) {
  logger.warn("⚠️  Could not verify program deployment");
}

// Step 8: Copy IDL and Types to SDK
logger.info("\n📦 Step 8: Updating SDK with latest IDL and Types...");

const programDir = path.resolve(__dirname, "..");
const sdkDir = path.resolve(programDir, "../sdk/src/program");

// Create SDK directories if they don't exist
if (!fs.existsSync(path.join(sdkDir, "types"))) {
  fs.mkdirSync(path.join(sdkDir, "types"), { recursive: true });
}
if (!fs.existsSync(path.join(sdkDir, "idl"))) {
  fs.mkdirSync(path.join(sdkDir, "idl"), { recursive: true });
}

const typesSrc = path.join(programDir, "target/types/aegis_vault.ts");
const typesDest = path.join(sdkDir, "types/aegis_vault.ts");

if (fs.existsSync(typesSrc)) {
  fs.copyFileSync(typesSrc, typesDest);
  logger.info("✅ Copied Types to SDK");
} else {
  logger.warn(`⚠️  Types file not found at ${typesSrc}`);
}

const idlSrc = path.join(programDir, "target/idl/aegis_vault.json");
const idlDest = path.join(sdkDir, "idl/aegis_vault.json");

if (fs.existsSync(idlSrc)) {
  fs.copyFileSync(idlSrc, idlDest);
  logger.info("✅ Copied IDL to SDK");
} else {
  logger.warn(`⚠️  IDL file not found at ${idlSrc}`);
}

// Step 9: Rebuild SDK
logger.info("\n🔧 Step 9: Rebuilding SDK...");
try {
  runCommand("cd ../sdk && pnpm build", true);
  logger.info("✅ SDK rebuilt successfully");
} catch (e) {
  logger.warn("⚠️  SDK rebuild failed - you may need to run 'pnpm build' in packages/sdk manually");
}

// Final summary
console.log("\n" + "=".repeat(60));
console.log("🎉 DEPLOYMENT COMPLETE!");
console.log("=".repeat(60));
console.log(`Environment: ${env.toUpperCase()}`);
console.log(`Program ID: ${programId}`);
console.log(`Deployer: ${address}`);
console.log(`Balance remaining: ${balance}`);
console.log("=".repeat(60));

// Next steps
logger.info("\n📝 NEXT STEPS:");
if (env === "devnet") {
  console.log("1. Run deployment checklist: cd packages/sdk && npx ts-node scripts/deploy-checklist.ts devnet");
  console.log("2. Initialize protocol (if needed): npx ts-node scripts/initialize-protocol.ts");
  console.log("3. Fix mint authority (if needed): npx ts-node scripts/fix-mint-authority.ts");
  console.log("4. Create vault types using admin app: cd apps/admin && pnpm dev");
  console.log("5. Test in web app: cd apps/web && pnpm dev");
} else if (env === "localnet") {
  console.log("1. Ensure solana-test-validator is running");
  console.log("2. Initialize protocol and test locally");
} else if (env === "mainnet") {
  console.log("1. ⚠️  VERIFY all tests pass on devnet first");
  console.log("2. Run security audit checklist");
  console.log("3. Initialize protocol with production settings");
  console.log("4. Set up monitoring and alerts");
}

console.log(`\n✨ Deployment to ${env} completed successfully!`);
console.log(`🔗 Explorer: https://explorer.solana.com/address/${programId}?cluster=${env}\n`);
