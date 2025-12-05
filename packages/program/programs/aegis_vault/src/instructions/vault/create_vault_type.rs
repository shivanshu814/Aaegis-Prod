use anchor_lang::prelude::*;
use crate::state::{ProtocolState, VaultType};
use crate::constants::seeds::{PROTOCOL_STATE_SEED, VAULT_TYPE_SEED};

#[derive(Accounts)]
#[instruction(collateral_mint: Pubkey, params: CreateVaultTypeParams)]
pub struct CreateVaultType<'info> {
    #[account(
        init,
        payer = admin,
        space = VaultType::LEN,
        seeds = [VAULT_TYPE_SEED, collateral_mint.key().as_ref()],
        bump
    )]
    pub vault_type: Account<'info, VaultType>,

    #[account(
        mut,
        seeds = [PROTOCOL_STATE_SEED],
        bump,
        constraint = protocol_state.admin_pubkey == admin.key(),
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct CreateVaultTypeParams {
    pub oracle_price_account: Pubkey,
    pub ltv_bps: u64,
    pub liq_threshold_bps: u64,
    pub liq_penalty_bps: u64,
    pub stability_fee_bps: u16,
    pub mint_fee_bps: u16,
    pub redeem_fee_bps: u16,
    pub vault_debt_ceiling: u64,
}

pub fn handler(
    ctx: Context<CreateVaultType>,
    collateral_mint: Pubkey,
    params: CreateVaultTypeParams,
) -> Result<()> {
    let vault_type = &mut ctx.accounts.vault_type;
    let clock = Clock::get()?;

    // Generate a pseudo-ID from the first 4 bytes of the mint address
    let mut id_bytes = [0u8; 4];
    id_bytes.copy_from_slice(&collateral_mint.to_bytes()[0..4]);
    vault_type.vault_type_id = u32::from_le_bytes(id_bytes);

    vault_type.collateral_mint = collateral_mint;
    vault_type.oracle_price_account = params.oracle_price_account;
    vault_type.ltv_bps = params.ltv_bps;
    vault_type.liq_threshold_bps = params.liq_threshold_bps;
    vault_type.liq_penalty_bps = params.liq_penalty_bps;
    vault_type.stability_fee_bps = params.stability_fee_bps;
    vault_type.mint_fee_bps = params.mint_fee_bps;
    vault_type.redeem_fee_bps = params.redeem_fee_bps;
    vault_type.vault_debt_ceiling = params.vault_debt_ceiling;
    
    // Derive vault_authority PDA bump
    let vault_type_key = vault_type.key();
    let (_vault_authority, bump) = Pubkey::find_program_address(
        &[b"vault_authority", vault_type_key.as_ref()],
        ctx.program_id,
    );
    vault_type.vault_authority_bump = bump;
    
    vault_type.is_active = true;
    vault_type.created_at = clock.unix_timestamp;
    vault_type.updated_at = clock.unix_timestamp;
    vault_type.reserved = [0; 96];

    msg!("Vault Type Created: {}", collateral_mint);
    Ok(())
}
