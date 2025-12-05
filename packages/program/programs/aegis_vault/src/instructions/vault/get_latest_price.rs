use anchor_lang::prelude::*;
use crate::state::ProtocolState;
use crate::utils::oracle::get_oracle_price;
use crate::constants::seeds::PROTOCOL_STATE_SEED;

#[derive(Accounts)]
pub struct GetLatestPrice<'info> {
    #[account(
        seeds = [PROTOCOL_STATE_SEED],
        bump,
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    /// CHECK: Validated by Pyth SDK in get_oracle_price
    pub oracle_price_account: AccountInfo<'info>,
}

use pyth_sdk_solana::state::{load_price_account, SolanaPriceAccount};

pub fn handler(ctx: Context<GetLatestPrice>) -> Result<u64> {
    // For UI display, we want to show the price even if it's stale or not trading.
    // The actual protocol logic uses strict checks in utils::oracle::get_oracle_price.
    
    let oracle_info = &ctx.accounts.oracle_price_account;
    let data = oracle_info.try_borrow_data()?;
    let price_account: &SolanaPriceAccount = load_price_account(&data)
        .map_err(|_| ProgramError::InvalidAccountData)?;
    
    let price = price_account.agg.price;
    let expo = price_account.expo;
    let price_f64 = price as f64 * 10f64.powi(expo as i32);
    
    // Value convert (for USD 6 decimals)
    let price_u64 = (price_f64 * 1_000_000.0) as u64;

    msg!("Latest Oracle Price (UI View): {}", price_u64);
    Ok(price_u64)
}
