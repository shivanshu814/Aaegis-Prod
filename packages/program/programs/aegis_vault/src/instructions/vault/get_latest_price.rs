use anchor_lang::prelude::*;
use crate::state::ProtocolState;
use crate::constants::seeds::PROTOCOL_STATE_SEED;
use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, PriceUpdateV2};

#[derive(Accounts)]
pub struct GetLatestPrice<'info> {
    #[account(
        seeds = [PROTOCOL_STATE_SEED],
        bump,
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    /// CHECK: Validated by Pyth SDK
    pub oracle_price_account: AccountInfo<'info>,
}

pub fn handler(ctx: Context<GetLatestPrice>) -> Result<u64> {
    // For UI display, we want to show the price even if it's a bit stale
    // The actual protocol logic uses strict checks in utils::oracle::get_oracle_price.
    
    let oracle_info = &ctx.accounts.oracle_price_account;
    
    // Load the price update account
    let price_update = PriceUpdateV2::try_deserialize(&mut &oracle_info.data.borrow()[..])
        .map_err(|_| ProgramError::InvalidAccountData)?;
    
    // Get the price feed for SOL/USD
    let feed_id = get_feed_id_from_hex("ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d")
        .map_err(|_| ProgramError::InvalidAccountData)?;
    
    // Get price with a generous TTL for UI display (1 day)
    let price_feed = price_update.get_price_no_older_than(
        &Clock::get()?,
        86400, // 24 hours in seconds
        &feed_id
    ).map_err(|_| ProgramError::InvalidAccountData)?;
    
    // Convert to 6 decimal places
    let price_f64 = (price_feed.price as f64) * 10f64.powi(6 + price_feed.exponent);
    let price_u64 = price_f64 as u64;

    msg!("Latest Oracle Price (UI View): {}", price_u64);
    Ok(price_u64)
}
