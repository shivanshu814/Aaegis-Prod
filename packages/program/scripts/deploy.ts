import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { logger } from "../utils";

// Get environment from args
const env = process.argv[2];
if (!env) {
  logger.error("Usage: ts-node scripts/deploy.ts <environment>");
  logger.info("Environments: localnet, devnet, mainnet");
  process.exit(1);
}

const runCommand = (command: string) => {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    logger.error(`Command failed: ${command}`);
    process.exit(1);
  }
};

logger.info(`🚀 Deploying to ${env}...`);

// Build the program
logger.info("🔨 Building program...");
runCommand("anchor build");

// Deploy the program
logger.info(`fw Deploying program to ${env}...`);
runCommand(`anchor deploy --provider.cluster ${env}`);

// Define paths
const programDir = path.resolve(__dirname, "..");
const sdkDir = path.resolve(programDir, "../sdk/src/program");

// Create SDK directories if they don't exist
if (!fs.existsSync(path.join(sdkDir, "types"))) {
  fs.mkdirSync(path.join(sdkDir, "types"), { recursive: true });
}
if (!fs.existsSync(path.join(sdkDir, "idl"))) {
  fs.mkdirSync(path.join(sdkDir, "idl"), { recursive: true });
}

// Copy IDL and Types to SDK
logger.info("📦 Copying IDL and Types to SDK...");

const typesSrc = path.join(programDir, "target/types/aegis_vault.ts");
const typesDest = path.join(sdkDir, "types/aegis_vault.ts");

if (fs.existsSync(typesSrc)) {
  fs.copyFileSync(typesSrc, typesDest);
  logger.info("✅ Copied Types");
} else {
  logger.warn(`⚠️  Types file not found at ${typesSrc}`);
}

const idlSrc = path.join(programDir, "target/idl/aegis_vault.json");
const idlDest = path.join(sdkDir, "idl/aegis_vault.json");

if (fs.existsSync(idlSrc)) {
  fs.copyFileSync(idlSrc, idlDest);
  logger.info("✅ Copied IDL");
} else {
  logger.warn(`⚠️  IDL file not found at ${idlSrc}`);
}

logger.info(`🎉 Deployment to ${env} complete and SDK updated!`);
