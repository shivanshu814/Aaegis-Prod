use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Burn};
use crate::state::{Position, VaultType, ProtocolState};
use crate::constants::seeds::POSITION_SEED;
use crate::errors::codes::AegisError;

#[derive(Accounts)]
pub struct RepayStablecoin<'info> {
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

    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<RepayStablecoin>, amount: u64) -> Result<()> {
    require!(amount > 0, AegisError::InvalidAmount);

    let position = &mut ctx.accounts.position;
    let protocol_state = &mut ctx.accounts.protocol_state;

    // Check if repaying more than debt
    require!(amount <= position.debt_amount, AegisError::InvalidAmount);

    // Burn stablecoin from user
    let cpi_accounts = Burn {
        mint: ctx.accounts.stablecoin_mint.to_account_info(),
        from: ctx.accounts.user_stablecoin_account.to_account_info(),
        authority: ctx.accounts.owner.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::burn(cpi_ctx, amount)?;

    // Update position
    position.debt_amount = position.debt_amount
        .checked_sub(amount)
        .ok_or(AegisError::MathOverflow)?;
    position.updated_at = Clock::get()?.unix_timestamp;

    // Update protocol state
    protocol_state.total_protocol_debt = protocol_state.total_protocol_debt
        .checked_sub(amount)
        .ok_or(AegisError::MathOverflow)?;

    msg!("Repaid {} stablecoin, remaining debt: {}", amount, position.debt_amount);
    Ok(())
}
