use anchor_lang::prelude::*;

#[account]
pub struct Position {
    /// Owner of this position
    pub owner: Pubkey,
    
    /// Vault type this position belongs to
    pub vault_type: Pubkey,
    
    /// Amount of collateral deposited (in collateral token decimals)
    pub collateral_amount: u64,
    
    /// Amount of stablecoin debt (in 6 decimals)
    pub debt_amount: u64,
    
    /// Timestamp when position was created
    pub created_at: i64,
    
    /// Timestamp when position was last updated
    pub updated_at: i64,
}

impl Position {
    pub const LEN: usize = 8 + // discriminator
        32 + // owner
        32 + // vault_type
        8 +  // collateral_amount
        8 +  // debt_amount
        8 +  // created_at
        8;   // updated_at
}
