use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Burn, Transfer};
use crate::state::{Position, VaultType, ProtocolState};
use crate::constants::seeds::POSITION_SEED;
use crate::utils::oracle::get_oracle_price;
use crate::errors::codes::AegisError;

#[derive(Accounts)]
pub struct LiquidatePosition<'info> {
    #[account(
        mut,
        seeds = [
            POSITION_SEED,
            position.owner.as_ref(),
            vault_type.key().as_ref()
        ],
        bump,
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
    pub liquidator_stablecoin_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub liquidator_collateral_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = vault_collateral_account.mint == vault_type.collateral_mint,
        constraint = vault_collateral_account.owner == vault_authority.key()
    )]
    pub vault_collateral_account: Account<'info, TokenAccount>,

    /// CHECK: PDA that has authority over vault collateral
    #[account(
        seeds = [b"vault_authority", vault_type.key().as_ref()],
        bump = vault_type.vault_authority_bump
    )]
    pub vault_authority: AccountInfo<'info>,

    /// CHECK: Validated by Pyth SDK
    pub oracle_price_account: AccountInfo<'info>,

    pub liquidator: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<LiquidatePosition>, repay_amount: u64) -> Result<()> {
    require!(repay_amount > 0, AegisError::InvalidAmount);

    let position = &mut ctx.accounts.position;
    let vault_type = &ctx.accounts.vault_type;
    let protocol_state = &mut ctx.accounts.protocol_state;

    // Get oracle price
    let price = get_oracle_price(
        &ctx.accounts.oracle_price_account,
        protocol_state,
    )?;

    // Calculate collateral value
    let collateral_value = (position.collateral_amount as u128)
        .checked_mul(price as u128)
        .ok_or(AegisError::MathOverflow)?
        .checked_div(1_000_000)
        .ok_or(AegisError::MathOverflow)? as u64;

    // Calculate current LTV (debt / collateral_value)
    let current_ltv_bps = if collateral_value > 0 {
        (position.debt_amount as u128)
            .checked_mul(10_000)
            .ok_or(AegisError::MathOverflow)?
            .checked_div(collateral_value as u128)
            .ok_or(AegisError::MathOverflow)? as u64
    } else {
        u64::MAX // If no collateral, position is underwater
    };

    // Check if position is liquidatable
    require!(
        current_ltv_bps >= vault_type.liq_threshold_bps,
        AegisError::PositionHealthy
    );

    // Limit repay to position debt
    let actual_repay = repay_amount.min(position.debt_amount);

    // Calculate bonus collateral for liquidator
    // bonus = repay_amount * (1 + penalty)
    let repay_value_with_penalty = (actual_repay as u128)
        .checked_mul(10_000 + vault_type.liq_penalty_bps as u128)
        .ok_or(AegisError::MathOverflow)?
        .checked_div(10_000)
        .ok_or(AegisError::MathOverflow)? as u64;

    // Convert to collateral amount
    let bonus_collateral = (repay_value_with_penalty as u128)
        .checked_mul(1_000_000)
        .ok_or(AegisError::MathOverflow)?
        .checked_div(price as u128)
        .ok_or(AegisError::MathOverflow)? as u64;

    // Ensure we don't transfer more collateral than available
    let collateral_to_transfer = bonus_collateral.min(position.collateral_amount);

    // Burn stablecoin from liquidator
    let cpi_accounts = Burn {
        mint: ctx.accounts.stablecoin_mint.to_account_info(),
        from: ctx.accounts.liquidator_stablecoin_account.to_account_info(),
        authority: ctx.accounts.liquidator.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::burn(cpi_ctx, actual_repay)?;

    // Transfer collateral to liquidator
    let vault_type_key = vault_type.key();
    let seeds = &[
        b"vault_authority".as_ref(),
        vault_type_key.as_ref(),
        &[vault_type.vault_authority_bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.vault_collateral_account.to_account_info(),
        to: ctx.accounts.liquidator_collateral_account.to_account_info(),
        authority: ctx.accounts.vault_authority.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, collateral_to_transfer)?;

    // Update position
    position.debt_amount = position.debt_amount
        .checked_sub(actual_repay)
        .ok_or(AegisError::MathOverflow)?;
    position.collateral_amount = position.collateral_amount
        .checked_sub(collateral_to_transfer)
        .ok_or(AegisError::MathOverflow)?;
    position.updated_at = Clock::get()?.unix_timestamp;

    // Update protocol state
    protocol_state.total_protocol_debt = protocol_state.total_protocol_debt
        .checked_sub(actual_repay)
        .ok_or(AegisError::MathOverflow)?;

    msg!("Liquidated {} debt, seized {} collateral", actual_repay, collateral_to_transfer);
    Ok(())
}
