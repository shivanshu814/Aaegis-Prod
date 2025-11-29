import fs from "fs";
import path from "path";
import { logger } from "../src/utils/logger";

const programIdlPath = path.join(
  __dirname,
  "../../program/target/idl/aegis_vault.json"
);

// Copy the IDL to the SDK
const sdkIdlPath = path.join(__dirname, "../src/program/idl/aegis_vault.json");
if (fs.existsSync(programIdlPath)) {
  try {
    fs.copyFileSync(programIdlPath, sdkIdlPath);
    logger.info("Program IDL copied to SDK");
  } catch (error: any) {
    logger.error(`Failed to copy Program IDL: ${error.message}`);
    process.exit(1);
  }
} else {
  logger.warn(
    `Program IDL not found at ${programIdlPath}. Using committed version in SDK.`
  );
}

// Copy the types to the SDK
const programTypesPath = path.join(
  __dirname,
  "../../program/target/types/aegis_vault.ts"
);
const sdkTypesPath = path.join(
  __dirname,
  "../src/program/types/aegis_vault.ts"
);

if (fs.existsSync(programTypesPath)) {
  try {
    fs.copyFileSync(programTypesPath, sdkTypesPath);
    logger.info("Program types copied to SDK");
  } catch (error: any) {
    logger.error(`Failed to copy Program types: ${error.message}`);
    process.exit(1);
  }
} else {
  logger.warn(
    `Program types not found at ${programTypesPath}. Using committed version in SDK.`
  );
}
