use anchor_lang::prelude::*;
use crate::state::ProtocolState;
use crate::errors::AegisError;
use crate::constants::*;

#[derive(Accounts)]
pub struct UpdateTreasury<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_STATE_SEED],
        bump,
        has_one = governance_pubkey @ AegisError::Unauthorized
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    pub governance_pubkey: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateTreasury>, new_treasury: Pubkey) -> Result<()> {
    let protocol_state = &mut ctx.accounts.protocol_state;
    let clock = Clock::get()?;

    protocol_state.treasury_pubkey = new_treasury;
    protocol_state.updated_at = clock.unix_timestamp;

    msg!("Treasury updated to: {}", new_treasury);

    Ok(())
}
