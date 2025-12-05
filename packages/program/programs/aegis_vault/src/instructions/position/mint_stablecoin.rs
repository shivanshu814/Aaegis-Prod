use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, MintTo};
use crate::state::{Position, VaultType, ProtocolState};
use crate::constants::seeds::POSITION_SEED;
use crate::utils::oracle::get_oracle_price;
use crate::errors::codes::AegisError;

#[derive(Accounts)]
pub struct MintStablecoin<'info> {
    #[account(
        mut,
        seeds = [
            POSITION_SEED,
            owner.key().as_ref(),
            vault_type.key().as_ref()
        ],
        bump,
        has_one = owner,
        has_one = vault_type
    )]
    pub position: Account<'info, Position>,

    pub vault_type: Account<'info, VaultType>,

    #[account(mut)]
    pub protocol_state: Account<'info, ProtocolState>,

    #[account(
        mut,
        constraint = stablecoin_mint.key() == protocol_state.stablecoin_mint @ AegisError::Unauthorized
    )]
    pub stablecoin_mint: Account<'info, Mint>,

    #[account(mut)]
    pub user_stablecoin_account: Account<'info, TokenAccount>,

    /// CHECK: PDA that has mint authority
    pub mint_authority: AccountInfo<'info>,

    /// CHECK: Validated by Pyth SDK
    pub oracle_price_account: AccountInfo<'info>,

    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<MintStablecoin>, amount: u64) -> Result<()> {
    require!(amount > 0, AegisError::InvalidAmount);

    let position = &mut ctx.accounts.position;
    let vault_type = &ctx.accounts.vault_type;
    let protocol_state = &mut ctx.accounts.protocol_state;

    // Get oracle price (with staleness and TTL checks)
    let price = get_oracle_price(
        &ctx.accounts.oracle_price_account,
        protocol_state,
    )?;

    // Calculate collateral value in USD (6 decimals)
    let collateral_value = (position.collateral_amount as u128)
        .checked_mul(price as u128)
        .ok_or(AegisError::MathOverflow)?
        .checked_div(1_000_000) // Normalize to 6 decimals
        .ok_or(AegisError::MathOverflow)? as u64;

    // Calculate max borrow based on LTV
    let max_borrow = (collateral_value as u128)
        .checked_mul(vault_type.ltv_bps.into())
        .ok_or(AegisError::MathOverflow)?
        .checked_div(10_000)
        .ok_or(AegisError::MathOverflow)? as u64;

    // Calculate new debt
    let new_debt = position.debt_amount
        .checked_add(amount)
        .ok_or(AegisError::MathOverflow)?;

    // Check if new debt exceeds max borrow
    require!(new_debt <= max_borrow, AegisError::ExceedsLTV);

    // Check vault debt ceiling
    require!(
        new_debt <= vault_type.vault_debt_ceiling,
        AegisError::ExceedsDebtCeiling
    );

    // Check global debt ceiling
    let new_global_debt = protocol_state.total_protocol_debt
        .checked_add(amount)
        .ok_or(AegisError::MathOverflow)?;
    require!(
        new_global_debt <= protocol_state.global_debt_ceiling,
        AegisError::ExceedsDebtCeiling
    );

    // Mint stablecoin to user
    let seeds = &[
        b"mint_authority".as_ref(),
        &[protocol_state.mint_authority_bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = MintTo {
        mint: ctx.accounts.stablecoin_mint.to_account_info(),
        to: ctx.accounts.user_stablecoin_account.to_account_info(),
        authority: ctx.accounts.mint_authority.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::mint_to(cpi_ctx, amount)?;

    // Update position
    position.debt_amount = new_debt;
    position.updated_at = Clock::get()?.unix_timestamp;

    // Update protocol state
    protocol_state.total_protocol_debt = new_global_debt;

    msg!("Minted {} stablecoin, new debt: {}", amount, new_debt);
    Ok(())
}
