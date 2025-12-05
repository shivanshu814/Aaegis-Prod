use anchor_lang::prelude::*;
use crate::state::ProtocolState;
use crate::errors::codes::AegisError;
use crate::constants::seeds::PROTOCOL_STATE_SEED;

#[derive(Accounts)]
pub struct UpdateOracleAuthority<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_STATE_SEED],
        bump,
        has_one = admin_pubkey @ AegisError::Unauthorized
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    pub admin_pubkey: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateOracleAuthority>, new_authority: Pubkey) -> Result<()> {
    let protocol_state = &mut ctx.accounts.protocol_state;
    protocol_state.oracle_update_authority = new_authority;
    
    // Update timestamp
    let clock = Clock::get()?;
    protocol_state.updated_at = clock.unix_timestamp;

    Ok(())
}
