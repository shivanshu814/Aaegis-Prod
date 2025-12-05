use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{Position, VaultType, ProtocolState};
use crate::constants::seeds::POSITION_SEED;
use crate::utils::oracle::get_oracle_price;
use crate::errors::codes::AegisError;

#[derive(Accounts)]
pub struct WithdrawCollateral<'info> {
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

    pub protocol_state: Account<'info, ProtocolState>,

    #[account(mut)]
    pub user_collateral_account: Account<'info, TokenAccount>,

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

    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<WithdrawCollateral>, amount: u64) -> Result<()> {
    require!(amount > 0, AegisError::InvalidAmount);

    let position = &mut ctx.accounts.position;
    let vault_type = &ctx.accounts.vault_type;

   // Check if withdrawing more than deposited
    require!(amount <= position.collateral_amount, AegisError::InsufficientCollateral);

    // Get oracle price
    let price = get_oracle_price(
        &ctx.accounts.oracle_price_account,
        &ctx.accounts.protocol_state,
    )?;

    // Calculate post-withdrawal collateral value
    let remaining_collateral = position.collateral_amount
        .checked_sub(amount)
        .ok_or(AegisError::MathOverflow)?;

    let remaining_collateral_value = (remaining_collateral as u128)
        .checked_mul(price as u128)
        .ok_or(AegisError::MathOverflow)?
        .checked_div(1_000_000)
        .ok_or(AegisError::MathOverflow)? as u64;

    // Calculate max borrow after withdrawal
    let max_borrow_after = (remaining_collateral_value as u128)
        .checked_mul(vault_type.ltv_bps.into())
        .ok_or(AegisError::MathOverflow)?
        .checked_div(10_000)
        .ok_or(AegisError::MathOverflow)? as u64;

    // Ensure position remains healthy
    require!(
        position.debt_amount <= max_borrow_after,
        AegisError::ExceedsLTV
    );

    // Transfer collateral from vault to user
    let vault_type_key = vault_type.key();
    let seeds = &[
        b"vault_authority".as_ref(),
        vault_type_key.as_ref(),
        &[vault_type.vault_authority_bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.vault_collateral_account.to_account_info(),
        to: ctx.accounts.user_collateral_account.to_account_info(),
        authority: ctx.accounts.vault_authority.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, amount)?;

    // Update position
    position.collateral_amount = remaining_collateral;
    position.updated_at = Clock::get()?.unix_timestamp;

    msg!("Withdrew {} collateral", amount);
    Ok(())
}
