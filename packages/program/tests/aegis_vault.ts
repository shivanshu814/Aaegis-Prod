import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import { AegisVault } from "../target/types/aegis_vault";

describe("aegis_vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AegisVault as Program<AegisVault>;

  const admin = provider.wallet;
  const treasury = anchor.web3.Keypair.generate();

  const [protocolStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("protocol_state")],
    program.programId
  );

  it("Is initialized with defaults!", async () => {
    await program.methods
      .initializeProtocol(treasury.publicKey)
      .accounts({
        admin: admin.publicKey,
      })
      .rpc();

    const protocolState = await program.account.protocolState.fetch(protocolStatePda);

    // Verify authorities - all should default to admin except treasury
    expect(protocolState.adminPubkey.toBase58()).to.equal(admin.publicKey.toBase58());
    expect(protocolState.governancePubkey.toBase58()).to.equal(admin.publicKey.toBase58());
    expect(protocolState.guardianPubkey.toBase58()).to.equal(admin.publicKey.toBase58());
    expect(protocolState.oracleUpdateAuthority.toBase58()).to.equal(admin.publicKey.toBase58());
    expect(protocolState.treasuryPubkey.toBase58()).to.equal(treasury.publicKey.toBase58());

    // Verify default risk params
    expect(protocolState.baseCollateralRatioBps.toNumber()).to.equal(15000); // 150%
    expect(protocolState.baseLiquidationThresholdBps.toNumber()).to.equal(13000); // 130%
    expect(protocolState.baseLiquidationPenaltyBps.toNumber()).to.equal(1000); // 10%
    expect(protocolState.baseStabilityFeeBps).to.equal(0); // 0%
    expect(protocolState.baseMintFeeBps).to.equal(0); // 0%
    expect(protocolState.baseRedeemFeeBps).to.equal(0); // 0%

    // Verify default supply limits
    expect(protocolState.globalDebtCeiling.toNumber()).to.equal(1_000_000_000_000);
    expect(protocolState.defaultVaultDebtCeiling.toNumber()).to.equal(10_000_000_000);

    // Verify emergency controls
    expect(protocolState.isProtocolPaused).to.be.false;
    expect(protocolState.isMintPaused).to.be.false;
    expect(protocolState.isRedeemPaused).to.be.false;
    expect(protocolState.isShutdown).to.be.false;

    // Verify metrics
    expect(protocolState.totalProtocolDebt.toNumber()).to.equal(0);
    expect(protocolState.totalProtocolCollateralValue.toNumber()).to.equal(0);

    // Verify metadata
    expect(protocolState.configVersion.toNumber()).to.equal(1);
    expect(protocolState.createdAt.toNumber()).to.be.greaterThan(0);
    expect(protocolState.updatedAt.toNumber()).to.be.greaterThan(0);
  });
});
