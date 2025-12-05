import type { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { AegisVaultIdl } from "./program/idl";
import { AegisVault } from "./program/types";

/**
 * Constants for the Aegis Protocol
 */
export const PROTOCOL_STATE_SEED = "protocol_state";

export const ROLE_GUARDIAN = 0;
export const ROLE_ORACLE_AUTHORITY = 1;
export const ROLE_GOVERNANCE = 2;
export const VAULT_TYPE_SEED = "vault-type";

/**
 * Aegis Protocol SDK Client
 * Provides methods to interact with the Aegis Vault program
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
   * Get the Protocol State PDA
   */
  public getProtocolStatePDA(): [PublicKey, number] {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(PROTOCOL_STATE_SEED)],
      this.program.programId
    );
  }

  /**
   * Initialize the protocol with a treasury address
   * 
   * @param treasury - Treasury public key
   * @returns Transaction signature
   */
  public async initializeProtocol(
    treasury: PublicKey
  ): Promise<string> {
    const admin = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .initializeProtocol(treasury)
      .accounts({
        admin,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Fetch the Protocol State account
   */
  public async fetchProtocolState(): Promise<any> {
    const [protocolState] = this.getProtocolStatePDA();
    return await this.program.account.protocolState.fetch(protocolState);
  }

  /**
   * Add a role to an account
   * 
   * @param targetAccount - Account to grant role to
   * @param roleType - Role type (0=Guardian, 1=Oracle, 2=Governance)
   * @returns Transaction signature
   */
  public async addRole(
    targetAccount: PublicKey,
    roleType: number
  ): Promise<string> {
    const [protocolState] = this.getProtocolStatePDA();
    const admin = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .addRole(roleType)
      .accounts({
        protocolState,
        adminPubkey: admin,
        targetAccount,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Remove a role
   * 
   * @param roleType - Role type to remove
   * @returns Transaction signature
   */
  public async removeRole(roleType: number): Promise<string> {
    const [protocolState] = this.getProtocolStatePDA();
    const admin = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .removeRole(roleType)
      .accounts({
        protocolState,
        adminPubkey: admin,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Update feature flags (pause/unpause protocol features)
   * 
   * @param params - Feature flags to update
   * @returns Transaction signature
   */
  public async updateFeatureFlags(params: {
    isProtocolPaused?: boolean;
    isMintPaused?: boolean;
    isRedeemPaused?: boolean;
    isShutdown?: boolean;
  }): Promise<string> {
    const [protocolState] = this.getProtocolStatePDA();
    const guardian = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .updateFeatureFlags({
        isProtocolPaused: params.isProtocolPaused ?? null,
        isMintPaused: params.isMintPaused ?? null,
        isRedeemPaused: params.isRedeemPaused ?? null,
        isShutdown: params.isShutdown ?? null,
      })
      .accounts({
        protocolState,
        guardianPubkey: guardian,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Set mint fee in basis points
   */
  public async setMintFeeBps(newMintFeeBps: number): Promise<string> {
    const [protocolState] = this.getProtocolStatePDA();
    const governance = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .setMintFeeBps(newMintFeeBps)
      .accounts({
        protocolState,
        governancePubkey: governance,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Set redeem fee in basis points
   */
  public async setRedeemFeeBps(newRedeemFeeBps: number): Promise<string> {
    const [protocolState] = this.getProtocolStatePDA();
    const governance = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .setRedeemFeeBps(newRedeemFeeBps)
      .accounts({
        protocolState,
        governancePubkey: governance,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Set collateral ratio in basis points
   */
  public async setCollateralRatioBps(newCollateralRatioBps: number): Promise<string> {
    const [protocolState] = this.getProtocolStatePDA();
    const governance = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .setCollateralRatioBps(new anchor.BN(newCollateralRatioBps))
      .accounts({
        protocolState,
        governancePubkey: governance,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Update treasury address
   */
  public async updateTreasury(newTreasury: PublicKey): Promise<string> {
    const [protocolState] = this.getProtocolStatePDA();
    const governance = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .updateTreasury(newTreasury)
      .accounts({
        protocolState,
        governancePubkey: governance,
      } as any)
      .rpc();

    return tx;
  }
  /**
   * Set stability fee in basis points
   */
  public async setStabilityFeeBps(newStabilityFeeBps: number): Promise<string> {
    const [protocolState] = this.getProtocolStatePDA();
    const governance = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .setStabilityFeeBps(newStabilityFeeBps)
      .accounts({
        protocolState,
        governancePubkey: governance,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Set liquidation penalty in basis points
   */
  public async setLiquidationPenaltyBps(newLiquidationPenaltyBps: number): Promise<string> {
    const [protocolState] = this.getProtocolStatePDA();
    const governance = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .setLiquidationPenaltyBps(new anchor.BN(newLiquidationPenaltyBps))
      .accounts({
        protocolState,
        governancePubkey: governance,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Set liquidation threshold in basis points
   */
  public async setLiquidationThresholdBps(newLiquidationThresholdBps: number): Promise<string> {
    const [protocolState] = this.getProtocolStatePDA();
    const governance = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .setLiquidationThresholdBps(new anchor.BN(newLiquidationThresholdBps))
      .accounts({
        protocolState,
        governancePubkey: governance,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Set global debt ceiling
   */
  public async setGlobalDebtCeiling(newGlobalDebtCeiling: number): Promise<string> {
    const [protocolState] = this.getProtocolStatePDA();
    const governance = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .setGlobalDebtCeiling(new anchor.BN(newGlobalDebtCeiling))
      .accounts({
        protocolState,
        governancePubkey: governance,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Set default vault debt ceiling
   */
  public async setDefaultVaultDebtCeiling(newDefaultVaultDebtCeiling: number): Promise<string> {
    const [protocolState] = this.getProtocolStatePDA();
    const governance = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .setDefaultVaultDebtCeiling(new anchor.BN(newDefaultVaultDebtCeiling))
      .accounts({
        protocolState,
        governancePubkey: governance,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Set Oracle TTL in seconds
   */
  public async setOracleTtlSeconds(newTtlSeconds: number): Promise<string> {
    const [protocolState] = this.getProtocolStatePDA();
    const governance = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .setOracleTtlSeconds(new anchor.BN(newTtlSeconds))
      .accounts({
        protocolState,
        governancePubkey: governance,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Set Stablecoin Mint
   */
  public async setStablecoinMint(stablecoinMint: PublicKey): Promise<string> {
    const [protocolState] = this.getProtocolStatePDA();
    const admin = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .setStablecoinMint(stablecoinMint)
      .accounts({
        protocolState,
        adminPubkey: admin,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Update Oracle Authority
   */
  public async updateOracleAuthority(newAuthority: PublicKey): Promise<string> {
    const [protocolState] = this.getProtocolStatePDA();
    const admin = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .updateOracleAuthority(newAuthority)
      .accounts({
        protocolState,
        adminPubkey: admin,
      } as any)
      .rpc();

    return tx;
  }


  /**
   * Get the Vault Type PDA
   */
  public getVaultTypePDA(collateralMint: PublicKey): [PublicKey, number] {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(VAULT_TYPE_SEED), collateralMint.toBuffer()],
      this.program.programId
    );
  }

  /**
   * Create a new vault type
   */
  public async createVaultType(
    collateralMint: PublicKey,
    params: {
      oraclePubkey: PublicKey;
      ltvBps: number;
      liqThresholdBps: number;
      liqPenaltyBps: number;
      stabilityFeeBps: number;
      mintFeeBps: number;
      redeemFeeBps: number;
      vaultDebtCeiling: number;
    }
  ): Promise<string> {
    const [vaultType] = this.getVaultTypePDA(collateralMint);
    const [protocolState] = this.getProtocolStatePDA();
    const admin = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .createVaultType(collateralMint, {
        oraclePriceAccount: params.oraclePubkey,
        ltvBps: new anchor.BN(params.ltvBps),
        liqThresholdBps: new anchor.BN(params.liqThresholdBps),
        liqPenaltyBps: new anchor.BN(params.liqPenaltyBps),
        stabilityFeeBps: params.stabilityFeeBps,
        mintFeeBps: params.mintFeeBps,
        redeemFeeBps: params.redeemFeeBps,
        vaultDebtCeiling: new anchor.BN(params.vaultDebtCeiling),
      })
      .accounts({
        vaultType,
        protocolState,
        admin,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Update an existing vault type
   */
  public async updateVaultType(
    collateralMint: PublicKey,
    params: {
      oraclePubkey?: PublicKey;
      ltvBps?: number;
      liqThresholdBps?: number;
      liqPenaltyBps?: number;
      stabilityFeeBps?: number;
      mintFeeBps?: number;
      redeemFeeBps?: number;
      vaultDebtCeiling?: number;
    }
  ): Promise<string> {
    const [vaultType] = this.getVaultTypePDA(collateralMint);
    const [protocolState] = this.getProtocolStatePDA();
    const admin = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .updateVaultType({
        oraclePriceAccount: params.oraclePubkey ?? null,
        ltvBps: params.ltvBps ? new anchor.BN(params.ltvBps) : null,
        liqThresholdBps: params.liqThresholdBps ? new anchor.BN(params.liqThresholdBps) : null,
        liqPenaltyBps: params.liqPenaltyBps ? new anchor.BN(params.liqPenaltyBps) : null,
        stabilityFeeBps: params.stabilityFeeBps ?? null,
        mintFeeBps: params.mintFeeBps ?? null,
        redeemFeeBps: params.redeemFeeBps ?? null,
        vaultDebtCeiling: params.vaultDebtCeiling ? new anchor.BN(params.vaultDebtCeiling) : null,
      })
      .accounts({
        vaultType,
        protocolState,
        admin,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Toggle vault active state
   */
  public async toggleVaultActive(collateralMint: PublicKey): Promise<string> {
    const [vaultType] = this.getVaultTypePDA(collateralMint);
    const [protocolState] = this.getProtocolStatePDA();
    const admin = (this.program.provider as any).wallet.publicKey;

    const tx = await this.program.methods
      .toggleVaultActive()
      .accounts({
        vaultType,
        protocolState,
        admin,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Fetch all vault types (with error handling for incompatible old accounts)
   */
  public async fetchAllVaultTypes(): Promise<any[]> {
    try {
      // Try to fetch all accounts normally
      const allAccounts = await this.program.account.vaultType.all();
      return allAccounts;
    } catch (error: any) {
      // If there's a deserialization error, fetch raw accounts and filter valid ones
      console.warn("Error fetching vault types, attempting manual filtering:", error.message);

      try {
        // Get all program accounts (this might include other account types too)
        const accounts = await this.program.provider.connection.getProgramAccounts(
          this.program.programId
        );

        const validVaultTypes: any[] = [];

        // Try to decode each account as a VaultType
        for (const account of accounts) {
          try {
            const decoded = this.program.coder.accounts.decode(
              "VaultType",
              account.account.data
            );
            validVaultTypes.push({
              publicKey: account.pubkey,
              account: decoded,
            });
          } catch (decodeError: any) {
            // Skip accounts that can't be decoded as VaultType (might be old or different account type)
            continue;
          }
        }

        console.log(`Successfully decoded ${validVaultTypes.length} valid vault types`);
        return validVaultTypes;
      } catch (manualError) {
        console.error("Manual fetch also failed:", manualError);
        return [];
      }
    }
  }

  /**
   * Fetch Oracle Price from Pyth Account via Program View
   * @param oraclePubkey - The Pyth Oracle Price Account Public Key
   * @returns The current price as a number, or null if unavailable
   */
  public async getOraclePrice(oraclePubkey: PublicKey): Promise<number | null> {
    try {
      const [protocolState] = this.getProtocolStatePDA();

      const priceBn = await this.program.methods
        .getLatestPrice()
        .accounts({
          protocolState,
          oraclePriceAccount: oraclePubkey,
        } as any)
        .view();

      // Convert from 6 decimals (program standard) to float
      return priceBn.toNumber() / 1_000_000;
    } catch (e: any) {
      console.error("=== Oracle Price Fetch Error ===");
      console.error("Oracle Account:", oraclePubkey.toString());
      console.error("Error:", e);
      console.error("Error Message:", e.message);

      if (e.logs) {
        console.error("Program Logs:", e.logs);
      }

      // Try to extract more details
      if (e.simulationResponse?.logs) {
        console.error("Simulation Logs:", e.simulationResponse.logs);
      }

      console.error("================================");
      return null;
    }
  }

  // ==================== Position Management ====================

  /**
   * Open a new position for a vault type
   */
  async openPosition(vaultType: PublicKey): Promise<string> {
    const owner = (this.program.provider as any).wallet.publicKey;
    const [position] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        owner.toBuffer(),
        vaultType.toBuffer(),
      ],
      this.program.programId
    );

    const tx = await this.program.methods
      .openPosition()
      .accounts({
        position,
        vaultType,
        owner,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    console.log("Position opened:", tx);
    return tx;
  }

  /**
   * Deposit collateral into a position
   */
  async depositCollateral(
    vaultType: PublicKey,
    amount: number,
    collateralMint: PublicKey
  ): Promise<string> {
    const owner = (this.program.provider as any).wallet.publicKey;
    const [position] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        owner.toBuffer(),
        vaultType.toBuffer(),
      ],
      this.program.programId
    );

    const [vaultAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_authority"), vaultType.toBuffer()],
      this.program.programId
    );

    const userCollateralAccount = await getAssociatedTokenAddress(
      collateralMint,
      owner
    );

    const vaultCollateralAccount = await getAssociatedTokenAddress(
      collateralMint,
      vaultAuthority,
      true // allowOwnerOffCurve
    );

    // Fetch vault type to get oracle
    const vaultTypeAccount = await this.program.account.vaultType.fetch(vaultType);

    const tx = await this.program.methods
      .depositCollateral(new anchor.BN(amount))
      .accounts({
        position,
        vaultType,
        protocolState: this.getProtocolStatePDA()[0],
        userCollateralAccount,
        vaultCollateralAccount,
        vaultAuthority,
        oraclePriceAccount: vaultTypeAccount.oraclePriceAccount,
        owner,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Mint stablecoin by borrowing against collateral
   */
  async mintStablecoin(
    vaultType: PublicKey,
    amount: number
  ): Promise<string> {
    const [position] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        (this.program.provider as any).wallet.publicKey.toBuffer(),
        vaultType.toBuffer(),
      ],
      this.program.programId
    );

    const protocolState = await this.fetchProtocolState();
    const vaultTypeAccount = await this.program.account.vaultType.fetch(vaultType);

    const userStablecoinAccount = await getAssociatedTokenAddress(
      protocolState.stablecoinMint,
      (this.program.provider as any).wallet.publicKey
    );

    const mintAuthority = PublicKey.createProgramAddressSync(
      [Buffer.from("mint_authority"), Buffer.from([protocolState.mintAuthorityBump])],
      this.program.programId
    );

    // Check if user stablecoin account exists
    const userStablecoinAccountInfo = await this.program.provider.connection.getAccountInfo(userStablecoinAccount);

    let builder = this.program.methods
      .mintStablecoin(new BN(amount))
      .accounts({
        position,
        vaultType,
        protocolState: this.getProtocolStatePDA()[0],
        stablecoinMint: protocolState.stablecoinMint,
        userStablecoinAccount,
        mintAuthority,
        oraclePriceAccount: vaultTypeAccount.oraclePriceAccount,
        owner: (this.program.provider as any).wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any);

    if (!userStablecoinAccountInfo) {
      console.log("Creating user stablecoin account...");
      builder = builder.preInstructions([
        createAssociatedTokenAccountInstruction(
          (this.program.provider as any).wallet.publicKey, // payer
          userStablecoinAccount, // associatedToken
          (this.program.provider as any).wallet.publicKey, // owner
          protocolState.stablecoinMint // mint
        )
      ]);
    }

    const tx = await builder.rpc();

    console.log("Stablecoin minted:", tx);
    return tx;
  }

  /**
   * Repay stablecoin debt
   */
  async repayStablecoin(
    vaultType: PublicKey,
    amount: number
  ): Promise<string> {
    const [position] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        (this.program.provider as any).wallet.publicKey.toBuffer(),
        vaultType.toBuffer(),
      ],
      this.program.programId
    );

    const protocolState = await this.fetchProtocolState();

    const userStablecoinAccount = await getAssociatedTokenAddress(
      protocolState.stablecoinMint,
      (this.program.provider as any).wallet.publicKey
    );

    const tx = await this.program.methods
      .repayStablecoin(new anchor.BN(amount))
      .accounts({
        position,
        vaultType,
        protocolState: this.getProtocolStatePDA()[0],
        stablecoinMint: protocolState.stablecoinMint,
        userStablecoinAccount,
        owner: (this.program.provider as any).wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .rpc();

    console.log("Stablecoin repaid:", tx);
    return tx;
  }

  /**
   * Withdraw collateral from position
   */
  async withdrawCollateral(
    vaultType: PublicKey,
    amount: number,
    collateralMint: PublicKey
  ): Promise<string> {
    const owner = (this.program.provider as any).wallet.publicKey;
    const [position] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        owner.toBuffer(),
        vaultType.toBuffer(),
      ],
      this.program.programId
    );

    const [vaultAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_authority"), vaultType.toBuffer()],
      this.program.programId
    );

    const userCollateralAccount = await getAssociatedTokenAddress(
      collateralMint,
      owner
    );

    const vaultCollateralAccount = await getAssociatedTokenAddress(
      collateralMint,
      vaultAuthority,
      true // allowOwnerOffCurve
    );

    // Fetch vault type to get oracle
    const vaultTypeAccount = await this.program.account.vaultType.fetch(vaultType);

    const tx = await this.program.methods
      .withdrawCollateral(new BN(amount))
      .accounts({
        position,
        vaultType,
        protocolState: this.getProtocolStatePDA()[0],
        userCollateralAccount,
        vaultCollateralAccount,
        vaultAuthority,
        oraclePriceAccount: vaultTypeAccount.oraclePriceAccount,
        owner,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .rpc();

    console.log("Collateral withdrawn:", tx);
    return tx;
  }

  /**
   * Fetch position data
   */
  async fetchPosition(vaultType: PublicKey, owner?: PublicKey): Promise<any> {
    const ownerPubkey = owner || (this.program.provider as any).wallet.publicKey;

    const [position] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        ownerPubkey.toBuffer(),
        vaultType.toBuffer(),
      ],
      this.program.programId
    );

    try {
      const positionData = await this.program.account.position.fetch(position);
      return positionData;
    } catch (e) {
      console.log("Position not found");
      return null;
    }
  }

  /**
   * Liquidate a position
   */
  async liquidatePosition(
    positionPubkey: PublicKey,
    repayAmount: number
  ): Promise<string> {
    // Need to fetch position to get vaultType and owner
    const positionAccount = await this.program.account.position.fetch(positionPubkey);
    const vaultType = positionAccount.vaultType;
    const vaultTypeAccount = await this.program.account.vaultType.fetch(vaultType);

    const [vaultAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_authority"), vaultType.toBuffer()],
      this.program.programId
    );

    const protocolState = await this.fetchProtocolState();
    const liquidator = (this.program.provider as any).wallet.publicKey;

    const liquidatorStablecoinAccount = await getAssociatedTokenAddress(
      protocolState.stablecoinMint,
      liquidator
    );

    const liquidatorCollateralAccount = await getAssociatedTokenAddress(
      vaultTypeAccount.collateralMint,
      liquidator
    );

    const vaultCollateralAccount = await getAssociatedTokenAddress(
      vaultTypeAccount.collateralMint,
      vaultAuthority,
      true
    );

    const tx = await this.program.methods
      .liquidatePosition(new anchor.BN(repayAmount))
      .accounts({
        position: positionPubkey,
        vaultType,
        protocolState: this.getProtocolStatePDA()[0],
        stablecoinMint: protocolState.stablecoinMint,
        liquidatorStablecoinAccount,
        liquidatorCollateralAccount,
        vaultCollateralAccount,
        vaultAuthority,
        oraclePriceAccount: vaultTypeAccount.oraclePriceAccount,
        liquidator,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Get wallet SOL balance in SOL (not lamports)
   */
  async getWalletBalance(walletPubkey?: PublicKey): Promise<number> {
    const wallet = walletPubkey || (this.program.provider as any).wallet.publicKey;
    const balance = await this.program.provider.connection.getBalance(wallet);
    return balance / 1_000_000_000; // Convert lamports to SOL
  }

  /**
   * Get token balance for a specific mint
   * @param mint - Token mint address
   * @param owner - Owner address (defaults to connected wallet)
   * @param decimals - Token decimals (default 9 for SOL)
   * @returns Token balance or 0 if account doesn't exist
   */
  async getTokenBalance(
    mint: PublicKey,
    owner?: PublicKey,
    decimals: number = 9
  ): Promise<number> {
    try {
      const ownerPubkey = owner || (this.program.provider as any).wallet.publicKey;
      const ata = await getAssociatedTokenAddress(mint, ownerPubkey);
      const tokenAccount = await this.program.provider.connection.getAccountInfo(ata);

      if (!tokenAccount) {
        return 0;
      }

      // Parse token account data (amount is at bytes 64-72)
      const amount = tokenAccount.data.readBigUInt64LE(64);
      return Number(amount) / Math.pow(10, decimals);
    } catch (e) {
      return 0;
    }
  }
}
