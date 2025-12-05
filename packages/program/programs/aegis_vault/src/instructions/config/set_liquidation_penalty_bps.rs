use anchor_lang::prelude::*;
use crate::state::ProtocolState;
use crate::errors::AegisError;
use crate::constants::*;

#[derive(Accounts)]
pub struct SetLiquidationPenaltyBps<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_STATE_SEED],
        bump,
        has_one = governance_pubkey @ AegisError::Unauthorized
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    pub governance_pubkey: Signer<'info>,
}

pub fn handler(ctx: Context<SetLiquidationPenaltyBps>, new_liquidation_penalty_bps: u64) -> Result<()> {
    require!(new_liquidation_penalty_bps <= 10000, AegisError::InvalidFee);

    let protocol_state = &mut ctx.accounts.protocol_state;
    let clock = Clock::get()?;

    protocol_state.base_liquidation_penalty_bps = new_liquidation_penalty_bps;
    protocol_state.updated_at = clock.unix_timestamp;

    msg!("Liquidation penalty updated to: {} bps", new_liquidation_penalty_bps);

    Ok(())
}
