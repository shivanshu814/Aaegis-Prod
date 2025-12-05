use anchor_lang::prelude::*;
use crate::state::ProtocolState;
use crate::errors::codes::AegisError;
use crate::constants::seeds::PROTOCOL_STATE_SEED;

#[derive(Accounts)]
pub struct SetOracleTtlSeconds<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_STATE_SEED],
        bump,
        has_one = governance_pubkey @ AegisError::Unauthorized
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    pub governance_pubkey: Signer<'info>,
}

pub fn handler(ctx: Context<SetOracleTtlSeconds>, new_ttl_seconds: i64) -> Result<()> {
    let protocol_state = &mut ctx.accounts.protocol_state;
    protocol_state.oracle_ttl_seconds = new_ttl_seconds;
    
    // Update timestamp
    let clock = Clock::get()?;
    protocol_state.updated_at = clock.unix_timestamp;

    Ok(())
}
