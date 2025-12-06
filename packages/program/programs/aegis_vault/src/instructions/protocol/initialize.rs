use anchor_lang::prelude::*;
use crate::state::ProtocolState;
use crate::constants::*;

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(
        init,
        payer = admin,
        space = ProtocolState::LEN,
        seeds = [PROTOCOL_STATE_SEED],
        bump
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeProtocol>,
    treasury_pubkey: Pubkey,
) -> Result<()> {
    let protocol_state = &mut ctx.accounts.protocol_state;
    let clock = Clock::get()?;

    // Set authorities - admin is the initializer, others default to admin initially
    protocol_state.admin_pubkey = ctx.accounts.admin.key();
    protocol_state.governance_pubkey = ctx.accounts.admin.key(); // Can be changed via add_role
    protocol_state.guardian_pubkey = ctx.accounts.admin.key(); // Can be changed via add_role
    protocol_state.oracle_update_authority = ctx.accounts.admin.key(); // Can be changed via add_role
    protocol_state.treasury_pubkey = treasury_pubkey;
    protocol_state.treasury_ata = Pubkey::default(); // Will be set when creating mint

    // Set stablecoin control - defaults, can be updated later
    protocol_state.stablecoin_mint = Pubkey::default(); // Will be set when creating mint
    protocol_state.mint_authority_bump = 0; // Will be set when creating mint

    // Set global risk params - Conservative defaults
    protocol_state.base_collateral_ratio_bps = DEFAULT_BASE_COLLATERAL_RATIO_BPS;
    protocol_state.base_liquidation_threshold_bps = DEFAULT_BASE_LIQUIDATION_THRESHOLD_BPS;
    protocol_state.base_liquidation_penalty_bps = DEFAULT_BASE_LIQUIDATION_PENALTY_BPS;
    protocol_state.base_stability_fee_bps = DEFAULT_BASE_STABILITY_FEE_BPS;
    protocol_state.base_mint_fee_bps = DEFAULT_BASE_MINT_FEE_BPS;
    protocol_state.base_redeem_fee_bps = DEFAULT_BASE_REDEEM_FEE_BPS;
    protocol_state.oracle_ttl_seconds = DEFAULT_ORACLE_TTL_SECONDS;

    // Set supply limits - Conservative defaults
    protocol_state.global_debt_ceiling = DEFAULT_GLOBAL_DEBT_CEILING;
    protocol_state.default_vault_debt_ceiling = DEFAULT_VAULT_DEBT_CEILING;

    // Initialize emergency controls (all false by default)
    protocol_state.is_protocol_paused = false;
    protocol_state.is_mint_paused = false;
    protocol_state.is_redeem_paused = false;
    protocol_state.is_shutdown = false;

    // Initialize protocol metrics (zero by default)
    protocol_state.total_protocol_debt = 0;
    protocol_state.total_protocol_collateral_value = 0;

    // Initialize fee tracking (zero by default)
    protocol_state.total_mint_fees_collected = 0;
    protocol_state.total_redeem_fees_collected = 0;
    protocol_state.total_liquidation_fees_collected = 0;

    // Set metadata
    protocol_state.config_version = INITIAL_CONFIG_VERSION;
    protocol_state.created_at = clock.unix_timestamp;
    protocol_state.updated_at = clock.unix_timestamp;

    // Initialize reserved bytes to zero (reduced size)
    protocol_state.reserved = [0u8; 40];


    msg!("Protocol Initialized with defaults");
    msg!("Admin: {}", protocol_state.admin_pubkey);
    msg!("Treasury: {}", protocol_state.treasury_pubkey);
    msg!("Base Collateral Ratio: {}%", protocol_state.base_collateral_ratio_bps / 100);
    msg!("Use setter functions to customize parameters");

    Ok(())
}
