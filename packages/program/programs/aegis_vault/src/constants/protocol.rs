// Protocol default values
pub const DEFAULT_BASE_COLLATERAL_RATIO_BPS: u64 = 15000; // 150%
pub const DEFAULT_BASE_LIQUIDATION_THRESHOLD_BPS: u64 = 13000; // 130%
pub const DEFAULT_BASE_LIQUIDATION_PENALTY_BPS: u64 = 1000; // 10%
pub const DEFAULT_BASE_STABILITY_FEE_BPS: u16 = 0; // 0%
pub const DEFAULT_BASE_MINT_FEE_BPS: u16 = 0; // 0%
pub const DEFAULT_BASE_REDEEM_FEE_BPS: u16 = 0; // 0%
pub const DEFAULT_ORACLE_TTL_SECONDS: i64 = 3600; // 1 hour

// Supply limits
pub const DEFAULT_GLOBAL_DEBT_CEILING: u64 = 1_000_000_000_000; // 1 trillion (6 decimals = 1M actual)
pub const DEFAULT_VAULT_DEBT_CEILING: u64 = 10_000_000_000; // 10 billion (6 decimals = 10K actual)

// Validation limits
pub const MAX_FEE_BPS: u16 = 10000; // 100%
pub const MAX_COLLATERAL_RATIO_BPS: u64 = 50000; // 500%
pub const MAX_LIQUIDATION_THRESHOLD_BPS: u64 = 50000; // 500%
pub const MAX_LIQUIDATION_PENALTY_BPS: u64 = 10000; // 100%

// Protocol version
pub const INITIAL_CONFIG_VERSION: u64 = 1;

// Reserved space for future upgrades
pub const RESERVED_BYTES_SIZE: usize = 64;
