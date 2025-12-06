use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Burn, Transfer};
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

    /// Treasury stablecoin account to receive fees
    #[account(
        mut,
        constraint = treasury_stablecoin_account.mint == protocol_state.stablecoin_mint @ AegisError::Unauthorized,
        constraint = treasury_stablecoin_account.owner == protocol_state.treasury_pubkey @ AegisError::Unauthorized
    )]
    pub treasury_stablecoin_account: Account<'info, TokenAccount>,

    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<RepayStablecoin>, amount: u64) -> Result<()> {
    require!(amount > 0, AegisError::InvalidAmount);

    let position = &mut ctx.accounts.position;
    let vault_type = &ctx.accounts.vault_type;
    let protocol_state = &mut ctx.accounts.protocol_state;

    // Check if redemption is paused
    require!(!protocol_state.is_redeem_paused, AegisError::RedeemPaused);
    require!(!protocol_state.is_protocol_paused, AegisError::ProtocolPaused);

    // Check if repaying more than debt
    require!(amount <= position.debt_amount, AegisError::InvalidAmount);

    // Calculate redeem fee (using vault type fee, falling back to protocol default)
    let redeem_fee_bps = if vault_type.redeem_fee_bps > 0 {
        vault_type.redeem_fee_bps as u64
    } else {
        protocol_state.base_redeem_fee_bps as u64
    };

    let fee_amount = (amount as u128)
        .checked_mul(redeem_fee_bps as u128)
        .ok_or(AegisError::MathOverflow)?
        .checked_div(10_000)
        .ok_or(AegisError::MathOverflow)? as u64;

    // Total user needs to pay = amount + fee
    let total_to_pay = amount.checked_add(fee_amount).ok_or(AegisError::MathOverflow)?;

    // Check user has enough balance
    require!(
        ctx.accounts.user_stablecoin_account.amount >= total_to_pay,
        AegisError::InsufficientBalance
    );

    // Transfer fee to treasury first
    if fee_amount > 0 {
        let cpi_accounts_fee = Transfer {
            from: ctx.accounts.user_stablecoin_account.to_account_info(),
            to: ctx.accounts.treasury_stablecoin_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts_fee);
        token::transfer(cpi_ctx, fee_amount)?;

        // Update fee tracking
        protocol_state.total_redeem_fees_collected = protocol_state.total_redeem_fees_collected
            .checked_add(fee_amount)
            .ok_or(AegisError::MathOverflow)?;
    }

    // Burn stablecoin from user (the repayment amount)
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
    protocol_state.updated_at = Clock::get()?.unix_timestamp;

    // Emit fee collection log for indexer
    msg!("RedeemFeeCollected: amount={} user={} vault={}", 
        fee_amount, 
        ctx.accounts.owner.key(), 
        vault_type.key()
    );
    msg!("Repaid {} stablecoin, fee: {}, remaining debt: {}", amount, fee_amount, position.debt_amount);
    
    Ok(())
}
