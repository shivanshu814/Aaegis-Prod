use anchor_lang::prelude::*;
use crate::state::ProtocolState;
use crate::errors::AegisError;
use crate::constants::*;

#[derive(Accounts)]
pub struct SetGlobalDebtCeiling<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_STATE_SEED],
        bump,
        has_one = governance_pubkey @ AegisError::Unauthorized
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    pub governance_pubkey: Signer<'info>,
}

pub fn handler(ctx: Context<SetGlobalDebtCeiling>, new_global_debt_ceiling: u64) -> Result<()> {
    let protocol_state = &mut ctx.accounts.protocol_state;
    let clock = Clock::get()?;

    protocol_state.global_debt_ceiling = new_global_debt_ceiling;
    protocol_state.updated_at = clock.unix_timestamp;

    msg!("Global debt ceiling updated to: {}", new_global_debt_ceiling);

    Ok(())
}
