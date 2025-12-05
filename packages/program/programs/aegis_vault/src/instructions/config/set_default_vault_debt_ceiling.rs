use anchor_lang::prelude::*;
use crate::state::ProtocolState;
use crate::errors::AegisError;
use crate::constants::*;

#[derive(Accounts)]
pub struct SetDefaultVaultDebtCeiling<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_STATE_SEED],
        bump,
        has_one = governance_pubkey @ AegisError::Unauthorized
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    pub governance_pubkey: Signer<'info>,
}

pub fn handler(ctx: Context<SetDefaultVaultDebtCeiling>, new_default_vault_debt_ceiling: u64) -> Result<()> {
    let protocol_state = &mut ctx.accounts.protocol_state;
    let clock = Clock::get()?;

    protocol_state.default_vault_debt_ceiling = new_default_vault_debt_ceiling;
    protocol_state.updated_at = clock.unix_timestamp;

    msg!("Default vault debt ceiling updated to: {}", new_default_vault_debt_ceiling);

    Ok(())
}
