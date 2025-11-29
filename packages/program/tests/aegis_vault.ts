import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AegisVault } from "../target/types/aegis_vault";
import { logger } from "../utils/logger";

describe("aegis_vault", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.AegisVault as Program<AegisVault>;

  it("Is initialized!", async () => {
    // Create a new keypair to store the message account
    const messageKeypair = anchor.web3.Keypair.generate();
    const message = "Hello from test";

    // Call initialize with the message and create the account on-chain
    const tx = await program.methods
      .initialize(message)
      .accounts({
        messageAccount: messageKeypair.publicKey,
        user: (program.provider as anchor.AnchorProvider).wallet.publicKey,
      })
      .signers([messageKeypair])
      .rpc();

    logger.info(`Your transaction signature: ${tx}`);

    // Fetch the account and verify the stored message
    const stored = await program.account.messageAccount.fetch(
      messageKeypair.publicKey
    );
    logger.info(`Stored message: ${stored.message}`);
    if (stored.message !== message) throw new Error("message mismatch");
  });
});
