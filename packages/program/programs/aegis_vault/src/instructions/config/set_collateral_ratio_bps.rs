use anchor_lang::prelude::*;
use crate::state::ProtocolState;
use crate::errors::AegisError;
use crate::constants::*;

#[derive(Accounts)]
pub struct SetCollateralRatioBps<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_STATE_SEED],
        bump,
        has_one = governance_pubkey @ AegisError::Unauthorized
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    pub governance_pubkey: Signer<'info>,
}

pub fn handler(ctx: Context<SetCollateralRatioBps>, new_collateral_ratio_bps: u64) -> Result<()> {
    require!(new_collateral_ratio_bps <= 50000, AegisError::InvalidFee); // Max 500%

    let protocol_state = &mut ctx.accounts.protocol_state;
    let clock = Clock::get()?;

    protocol_state.base_collateral_ratio_bps = new_collateral_ratio_bps;
    protocol_state.updated_at = clock.unix_timestamp;

    msg!("Collateral ratio updated to: {} bps", new_collateral_ratio_bps);

    Ok(())
}
