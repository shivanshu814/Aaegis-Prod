use anchor_lang::prelude::*;
use crate::state::{Position, VaultType};
use crate::constants::seeds::{POSITION_SEED};

#[derive(Accounts)]
pub struct OpenPosition<'info> {
    #[account(
        init,
        payer = owner,
        space = Position::LEN,
        seeds = [
            POSITION_SEED,
            owner.key().as_ref(),
            vault_type.key().as_ref()
        ],
        bump
    )]
    pub position: Account<'info, Position>,

    pub vault_type: Account<'info, VaultType>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<OpenPosition>) -> Result<()> {
    let position = &mut ctx.accounts.position;
    let clock = Clock::get()?;

    position.owner = ctx.accounts.owner.key();
    position.vault_type = ctx.accounts.vault_type.key();
    position.collateral_amount = 0;
    position.debt_amount = 0;
    position.created_at = clock.unix_timestamp;
    position.updated_at = clock.unix_timestamp;

    msg!("Position opened for user: {}", position.owner);
    Ok(())
}
