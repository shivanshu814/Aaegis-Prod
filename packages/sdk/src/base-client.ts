import type { Program } from "@coral-xyz/anchor";
import type { Keypair, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { AegisVault } from "./program/types";
import { AegisVaultIdl } from "./program/idl";

/**
 * Abstract base client for Solana programs
 * Provides common functionality for program interaction
 */
export class AegisClient {
  // Anchor Program instance bound to the AegisVault IDL.
  public readonly program: Program<AegisVault>;

  // Constructor
  constructor(provider: anchor.Provider) {
    this.program = new anchor.Program<AegisVault>(
      AegisVaultIdl as any,
      provider
    );
  }

  /**
   * Initialize a message on-chain by calling the Anchor program `initialize` instruction.
   *
   * @param messageKeypair - Keypair for the on‑chain message account (will be created).
   * @param message - The string to store on‑chain.
   * @returns Transaction signature.
   */
  public async initMessage(
    messageKeypair: Keypair,
    message: string
  ): Promise<string> {
    const prog = this.program;
    const tx = await (prog as any).methods
      .initialize(message)
      .accounts({
        messageAccount: messageKeypair.publicKey,
        user: (prog.provider as any).wallet.publicKey,
      })
      .signers([messageKeypair])
      .rpc();
    return tx;
  }

  /**
   * Fetch the stored message account and return its contents.
   *
   * @param messagePubkey - PublicKey of the message account.
   */
  public async fetchMessage(messagePubkey: PublicKey): Promise<any> {
    const prog = this.program;
    const acc = await (prog as any).account.messageAccount.fetch(messagePubkey);
    return acc;
  }
}
