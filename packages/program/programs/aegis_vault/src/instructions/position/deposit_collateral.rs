use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{Position, VaultType, ProtocolState};
use crate::constants::seeds::POSITION_SEED;
use crate::utils::oracle::get_oracle_price;
use crate::errors::codes::AegisError;


#[derive(Accounts)]
pub struct DepositCollateral<'info> {
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

pub fn handler(ctx: Context<DepositCollateral>, amount: u64) -> Result<()> {
    require!(amount > 0, crate::errors::AegisError::InvalidAmount);

    let position = &mut ctx.accounts.position;
    let clock = Clock::get()?;

    // Get oracle price (for informational purposes and validation)
    let _price = get_oracle_price(
        &ctx.accounts.oracle_price_account,
        &ctx.accounts.protocol_state,
    )?;

    // Transfer collateral from user to vault
    let cpi_accounts = Transfer {
        from: ctx.accounts.user_collateral_account.to_account_info(),
        to: ctx.accounts.vault_collateral_account.to_account_info(),
        authority: ctx.accounts.owner.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;

    // Update position
    position.collateral_amount = position.collateral_amount
        .checked_add(amount)
        .ok_or(crate::errors::AegisError::MathOverflow)?;
    position.updated_at = clock.unix_timestamp;

    msg!("Deposited {} collateral", amount);
    Ok(())
}
