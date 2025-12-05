use anchor_lang::prelude::*;
use crate::state::ProtocolState;
use crate::errors::AegisError;
use crate::constants::*;

#[derive(Accounts)]
pub struct SetStabilityFeeBps<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_STATE_SEED],
        bump,
        has_one = governance_pubkey @ AegisError::Unauthorized
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    pub governance_pubkey: Signer<'info>,
}

pub fn handler(ctx: Context<SetStabilityFeeBps>, new_stability_fee_bps: u16) -> Result<()> {
    require!(new_stability_fee_bps <= 10000, AegisError::InvalidFee);

    let protocol_state = &mut ctx.accounts.protocol_state;
    let clock = Clock::get()?;

    protocol_state.base_stability_fee_bps = new_stability_fee_bps;
    protocol_state.updated_at = clock.unix_timestamp;

    msg!("Stability fee updated to: {} bps", new_stability_fee_bps);

    Ok(())
}
