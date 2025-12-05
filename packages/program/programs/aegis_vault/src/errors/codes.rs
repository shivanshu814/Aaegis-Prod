use anchor_lang::prelude::*;

#[error_code]
pub enum AegisError {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
    #[msg("Fee must be less than or equal to 100% (10000 basis points).")]
    InvalidFee,
    #[msg("Math operation overflow.")]
    MathOverflow,
    #[msg("Protocol is currently paused.")]
    ProtocolPaused,
    #[msg("Protocol is shutdown.")]
    ProtocolShutdown,
    #[msg("Oracle price is stale or invalid.")]
    OracleStale,
    
    // Position-related errors
    #[msg("Invalid amount specified.")]
    InvalidAmount,
    #[msg("Exceeds LTV ratio limit.")]
    ExceedsLTV,
    #[msg("Exceeds debt ceiling.")]
    ExceedsDebtCeiling,
    #[msg("Position is healthy and cannot be liquidated.")]
    PositionHealthy,
    #[msg("Insufficient collateral in position.")]
    InsufficientCollateral,
}
