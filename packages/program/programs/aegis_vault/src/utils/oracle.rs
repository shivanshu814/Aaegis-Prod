use anchor_lang::prelude::*;
use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, PriceUpdateV2};
use crate::errors::codes::AegisError;
use crate::state::ProtocolState;

pub fn get_oracle_price(
    oracle_info: &AccountInfo,
    protocol: &ProtocolState,
) -> Result<u64> {
    // Load the price update account
    let price_update = PriceUpdateV2::try_deserialize(&mut &oracle_info.data.borrow()[..])
        .map_err(|_| error!(AegisError::OracleStale))?;
    
    // Get the price feed for SOL/USD
    // SOL/USD feed ID: 0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d
    let feed_id = get_feed_id_from_hex("ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d")
        .map_err(|_| error!(AegisError::OracleStale))?;
    
    let price_feed = price_update.get_price_no_older_than(
        &Clock::get()?,
        protocol.oracle_ttl_seconds as u64,
        &feed_id
    ).map_err(|_| error!(AegisError::OracleStale))?;
    
    // Convert price to u64 with 6 decimals
    // Pyth prices have a variable exponent, we need to normalize to 6 decimals
    let price_i64 = price_feed.price;
    let expo = price_feed.exponent;
    
    // Convert to 6 decimal places (USD standard)
    // Formula: price * 10^(6 - expo)
    let price_f64 = (price_i64 as f64) * 10f64.powi(6 + expo);
    
    if price_f64 < 0.0 {
        return Err(AegisError::OracleStale.into());
    }
    
    Ok(price_f64 as u64)
}
