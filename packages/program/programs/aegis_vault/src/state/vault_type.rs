use anchor_lang::prelude::*;

#[account]
pub struct VaultType {
    // Identity
    pub vault_type_id: u32,
    pub collateral_mint: Pubkey,
    pub oracle_price_account: Pubkey,

    // Risk Parameters
    pub ltv_bps: u64,
    pub liq_threshold_bps: u64,
    pub liq_penalty_bps: u64,
    pub stability_fee_bps: u16,
    pub mint_fee_bps: u16,
    pub redeem_fee_bps: u16,

    // Limits
    pub vault_debt_ceiling: u64,
    
    // PDA bumps
    pub vault_authority_bump: u8,
    
    // State
    pub is_active: bool,
    
    // Metadata
    pub created_at: i64,
    pub updated_at: i64,

    // Reserved
    pub reserved: [u8; 96],
}

impl VaultType {
    pub const LEN: usize = 8 + // discriminator
        4 + // vault_type_id
        32 + // collateral_mint
        32 + // oracle_pubkey
        8 + // ltv_bps
        8 + // liq_threshold_bps
        8 + // liq_penalty_bps
        2 + // stability_fee_bps
        2 + // mint_fee_bps
        2 + // redeem_fee_bps
        8 + // vault_debt_ceiling
        1 + // vault_authority_bump
        1 + // is_active
        8 + // created_at
        8 + // updated_at
        96; // reserved
}
