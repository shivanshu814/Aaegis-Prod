use anchor_lang::prelude::*;
use crate::state::ProtocolState;
use crate::errors::AegisError;
use crate::constants::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UpdateFeatureFlagsParams {
    pub is_protocol_paused: Option<bool>,
    pub is_mint_paused: Option<bool>,
    pub is_redeem_paused: Option<bool>,
    pub is_shutdown: Option<bool>,
}

#[derive(Accounts)]
pub struct UpdateFeatureFlags<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_STATE_SEED],
        bump,
        has_one = guardian_pubkey @ AegisError::Unauthorized
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    pub guardian_pubkey: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateFeatureFlags>, params: UpdateFeatureFlagsParams) -> Result<()> {
    let protocol_state = &mut ctx.accounts.protocol_state;
    let clock = Clock::get()?;

    if let Some(is_paused) = params.is_protocol_paused {
        protocol_state.is_protocol_paused = is_paused;
        msg!("Protocol paused status updated to: {}", is_paused);
    }

    if let Some(is_mint_paused) = params.is_mint_paused {
        protocol_state.is_mint_paused = is_mint_paused;
        msg!("Mint paused status updated to: {}", is_mint_paused);
    }

    if let Some(is_redeem_paused) = params.is_redeem_paused {
        protocol_state.is_redeem_paused = is_redeem_paused;
        msg!("Redeem paused status updated to: {}", is_redeem_paused);
    }

    if let Some(is_shutdown) = params.is_shutdown {
        protocol_state.is_shutdown = is_shutdown;
        msg!("Shutdown status updated to: {}", is_shutdown);
    }

    protocol_state.updated_at = clock.unix_timestamp;

    Ok(())
}
