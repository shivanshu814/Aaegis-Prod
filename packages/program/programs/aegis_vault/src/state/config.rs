use anchor_lang::prelude::*;

#[account]
pub struct ProtocolState {
    // Authorities
    pub admin_pubkey: Pubkey,
    pub governance_pubkey: Pubkey,
    pub guardian_pubkey: Pubkey,
    pub oracle_update_authority: Pubkey,
    pub treasury_pubkey: Pubkey,
    pub treasury_ata: Pubkey,

    // Stablecoin control
    pub stablecoin_mint: Pubkey,
    pub mint_authority_bump: u8,

    // Global risk params
    pub base_collateral_ratio_bps: u64,
    pub base_liquidation_threshold_bps: u64,
    pub base_liquidation_penalty_bps: u64,
    pub base_stability_fee_bps: u16,
    pub base_mint_fee_bps: u16,
    pub base_redeem_fee_bps: u16,
    pub oracle_ttl_seconds: i64,

    // Supply limits
    pub global_debt_ceiling: u64,
    pub default_vault_debt_ceiling: u64,

    // Emergency controls
    pub is_protocol_paused: bool,
    pub is_mint_paused: bool,
    pub is_redeem_paused: bool,
    pub is_shutdown: bool,

    // Protocol metrics
    pub total_protocol_debt: u64,
    pub total_protocol_collateral_value: u64,

    // Fee tracking (cumulative)
    pub total_mint_fees_collected: u64,
    pub total_redeem_fees_collected: u64,
    pub total_liquidation_fees_collected: u64,

    // Metadata
    pub config_version: u64,
    pub created_at: i64,
    pub updated_at: i64,

    // Reserved bytes (reduced to accommodate new fields)
    pub reserved: [u8; 40],
}

impl ProtocolState {
    pub const LEN: usize = 8 + // discriminator
        32 + // admin_pubkey
        32 + // governance_pubkey
        32 + // guardian_pubkey
        32 + // oracle_update_authority
        32 + // treasury_pubkey
        32 + // treasury_ata
        32 + // stablecoin_mint
        1 + // mint_authority_bump
        8 + // base_collateral_ratio_bps
        8 + // base_liquidation_threshold_bps
        8 + // base_liquidation_penalty_bps
        2 + // base_stability_fee_bps
        2 + // base_mint_fee_bps
        2 + // base_redeem_fee_bps
        8 + // oracle_ttl_seconds
        8 + // global_debt_ceiling
        8 + // default_vault_debt_ceiling
        1 + // is_protocol_paused
        1 + // is_mint_paused
        1 + // is_redeem_paused
        1 + // is_shutdown
        8 + // total_protocol_debt
        8 + // total_protocol_collateral_value
        8 + // total_mint_fees_collected
        8 + // total_redeem_fees_collected
        8 + // total_liquidation_fees_collected
        8 + // config_version
        8 + // created_at
        8 + // updated_at
        40; // reserved (reduced from 64)
}

