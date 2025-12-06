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

    /// Treasury collateral account to receive protocol's share of penalty
    #[account(
        mut,
        constraint = treasury_collateral_account.mint == vault_type.collateral_mint,
        constraint = treasury_collateral_account.owner == protocol_state.treasury_pubkey @ AegisError::Unauthorized
    )]
    pub treasury_collateral_account: Account<'info, TokenAccount>,

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

    // Check if protocol is paused
    require!(!protocol_state.is_protocol_paused, AegisError::ProtocolPaused);

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

    // Calculate health factor before liquidation (for logging)
    let health_factor_before = if position.debt_amount > 0 && collateral_value > 0 {
        (collateral_value as u128)
            .checked_mul(10_000)
            .ok_or(AegisError::MathOverflow)?
            .checked_div(position.debt_amount as u128)
            .ok_or(AegisError::MathOverflow)?
            .checked_div(vault_type.liq_threshold_bps as u128)
            .ok_or(AegisError::MathOverflow)? as u64
    } else {
        0
    };

    // Check if position is liquidatable
    require!(
        current_ltv_bps >= vault_type.liq_threshold_bps,
        AegisError::PositionHealthy
    );

    // Limit repay to position debt
    let actual_repay = repay_amount.min(position.debt_amount);

    // Calculate total collateral with penalty
    // Total = repay_amount * (1 + penalty_bps / 10000)
    let liq_penalty_bps = vault_type.liq_penalty_bps;
    
    let repay_value_with_penalty = (actual_repay as u128)
        .checked_mul(10_000 + liq_penalty_bps as u128)
        .ok_or(AegisError::MathOverflow)?
        .checked_div(10_000)
        .ok_or(AegisError::MathOverflow)? as u64;

    // Convert to collateral amount
    let total_bonus_collateral = (repay_value_with_penalty as u128)
        .checked_mul(1_000_000)
        .ok_or(AegisError::MathOverflow)?
        .checked_div(price as u128)
        .ok_or(AegisError::MathOverflow)? as u64;

    // Ensure we don't transfer more collateral than available
    let total_collateral_to_transfer = total_bonus_collateral.min(position.collateral_amount);

    // Split penalty between liquidator and protocol (50/50)
    // Liquidator gets: repay_value + half of penalty
    // Protocol gets: half of penalty
    let base_collateral = (actual_repay as u128)
        .checked_mul(1_000_000)
        .ok_or(AegisError::MathOverflow)?
        .checked_div(price as u128)
        .ok_or(AegisError::MathOverflow)? as u64;

    let penalty_collateral = total_collateral_to_transfer.saturating_sub(base_collateral);
    let protocol_fee_collateral = penalty_collateral / 2; // 50% to protocol
    let liquidator_bonus = penalty_collateral.saturating_sub(protocol_fee_collateral); // 50% to liquidator
    
    let liquidator_collateral = base_collateral.checked_add(liquidator_bonus).ok_or(AegisError::MathOverflow)?;

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
    let cpi_ctx = CpiContext::new_with_signer(cpi_program.clone(), cpi_accounts, signer);
    token::transfer(cpi_ctx, liquidator_collateral)?;

    // Transfer protocol fee to treasury
    if protocol_fee_collateral > 0 {
        let cpi_accounts_treasury = Transfer {
            from: ctx.accounts.vault_collateral_account.to_account_info(),
            to: ctx.accounts.treasury_collateral_account.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        };
        let cpi_ctx_treasury = CpiContext::new_with_signer(cpi_program, cpi_accounts_treasury, signer);
        token::transfer(cpi_ctx_treasury, protocol_fee_collateral)?;

        // Update fee tracking (convert collateral to USD value)
        let fee_value_usd = (protocol_fee_collateral as u128)
            .checked_mul(price as u128)
            .ok_or(AegisError::MathOverflow)?
            .checked_div(1_000_000)
            .ok_or(AegisError::MathOverflow)? as u64;

        protocol_state.total_liquidation_fees_collected = protocol_state.total_liquidation_fees_collected
            .checked_add(fee_value_usd)
            .ok_or(AegisError::MathOverflow)?;
    }

    // Update position
    position.debt_amount = position.debt_amount
        .checked_sub(actual_repay)
        .ok_or(AegisError::MathOverflow)?;
    position.collateral_amount = position.collateral_amount
        .checked_sub(total_collateral_to_transfer)
        .ok_or(AegisError::MathOverflow)?;
    position.updated_at = Clock::get()?.unix_timestamp;

    // Update protocol state
    protocol_state.total_protocol_debt = protocol_state.total_protocol_debt
        .checked_sub(actual_repay)
        .ok_or(AegisError::MathOverflow)?;
    protocol_state.updated_at = Clock::get()?.unix_timestamp;

    // Capture values for logging (after mutable borrows are done)
    let position_owner = position.owner;
    let position_key = ctx.accounts.position.key();
    let vault_type_key = vault_type.key();
    let liquidator_key = ctx.accounts.liquidator.key();

    // Emit detailed liquidation log for indexer
    msg!("PositionLiquidated: liquidator={} owner={} position={} vault={} debt={} collateral={} penalty={} price={} health={}",
        liquidator_key,
        position_owner,
        position_key,
        vault_type_key,
        actual_repay,
        total_collateral_to_transfer,
        protocol_fee_collateral,
        price,
        health_factor_before
    );
    msg!("LiquidationPenaltyCollected: amount={} user={} vault={}",
        protocol_fee_collateral,
        position_owner,
        vault_type_key
    );
    msg!("Liquidated {} debt, seized {} collateral (liquidator: {}, protocol: {})", 
        actual_repay, 
        total_collateral_to_transfer,
        liquidator_collateral,
        protocol_fee_collateral
    );
    
    Ok(())
}

