import { AegisClient } from "../src";
import * as anchor from "@coral-xyz/anchor";
import { assert } from "chai";
import { logger } from "../src/utils";

describe("Aegis SDK Client", () => {
  // Use the environment provider (wallet and cluster from env or defaults)
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const client = new AegisClient(provider);

  it("should initialize a message", async () => {
    const messageKeypair = anchor.web3.Keypair.generate();
    const message = "Hello SDK Test";

    logger.info(
      `Initializing message account: ${messageKeypair.publicKey.toBase58()}`
    );

    try {
      const tx = await client.initMessage(messageKeypair, message);
      logger.info(`Transaction signature: ${tx}`);
      assert.ok(tx, "Transaction signature should exist");

      // Fetch the message to verify
      const account = await client.fetchMessage(messageKeypair.publicKey);
      logger.info(`Fetched message: ${account.message}`);
      assert.equal(account.message, message, "Message should match");
    } catch (err) {
      logger.error(`Error: ${err}`);
      throw err;
    }
  });
});
