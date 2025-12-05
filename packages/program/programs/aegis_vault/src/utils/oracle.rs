use anchor_lang::prelude::*;
use pyth_sdk_solana::state::{load_price_account, SolanaPriceAccount};
use crate::errors::codes::AegisError;
use crate::state::ProtocolState;

pub fn get_oracle_price(
    oracle_info: &AccountInfo,
    protocol: &ProtocolState,
) -> Result<u64> {
    let data = oracle_info.try_borrow_data()?;
    let price_account: &SolanaPriceAccount = load_price_account(&data)
        .map_err(|_| error!(AegisError::OracleStale))?;
    
    let price = price_account.agg.price;
    let expo = price_account.expo;
    let price_f64 = price as f64 * 10f64.powi(expo as i32);

    // Oracle fresh check
    if price_account.agg.status != pyth_sdk_solana::state::PriceStatus::Trading {
        return Err(AegisError::OracleStale.into());
    }

    // TTL check
    let now = Clock::get()?.unix_timestamp;
    if now - price_account.timestamp > protocol.oracle_ttl_seconds {
        return Err(AegisError::OracleStale.into());
    }

    // Value convert (for USD 6 decimals)
    let price_u64 = (price_f64 * 1_000_000.0) as u64;

    Ok(price_u64)
}
