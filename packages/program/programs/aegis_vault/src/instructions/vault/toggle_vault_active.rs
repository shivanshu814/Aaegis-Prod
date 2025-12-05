use anchor_lang::prelude::*;
use crate::state::{ProtocolState, VaultType};
use crate::constants::seeds::{PROTOCOL_STATE_SEED, VAULT_TYPE_SEED};

#[derive(Accounts)]
pub struct ToggleVaultActive<'info> {
    #[account(
        mut,
        seeds = [VAULT_TYPE_SEED, vault_type.collateral_mint.key().as_ref()],
        bump
    )]
    pub vault_type: Account<'info, VaultType>,

    #[account(
        seeds = [PROTOCOL_STATE_SEED],
        bump,
        constraint = protocol_state.admin_pubkey == admin.key(),
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    pub admin: Signer<'info>,
}

pub fn handler(ctx: Context<ToggleVaultActive>) -> Result<()> {
    let vault_type = &mut ctx.accounts.vault_type;
    let clock = Clock::get()?;

    vault_type.is_active = !vault_type.is_active;
    vault_type.updated_at = clock.unix_timestamp;

    msg!("Vault Type Active Toggled: {} -> {}", vault_type.collateral_mint, vault_type.is_active);
    Ok(())
}
