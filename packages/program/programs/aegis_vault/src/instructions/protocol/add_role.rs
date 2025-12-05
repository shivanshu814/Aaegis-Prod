use anchor_lang::prelude::*;
use crate::state::ProtocolState;
use crate::errors::AegisError;
use crate::constants::*;

#[derive(Accounts)]
pub struct AddRole<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_STATE_SEED],
        bump,
        has_one = admin_pubkey @ AegisError::Unauthorized
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    pub admin_pubkey: Signer<'info>,

    /// CHECK: The account to grant role to
    pub target_account: AccountInfo<'info>,
}

pub fn handler(ctx: Context<AddRole>, role_type: u8) -> Result<()> {
    let protocol_state = &mut ctx.accounts.protocol_state;
    let clock = Clock::get()?;

    match role_type {
        ROLE_GUARDIAN => {
            protocol_state.guardian_pubkey = ctx.accounts.target_account.key();
            msg!("Guardian role added to: {}", ctx.accounts.target_account.key());
        }
        ROLE_ORACLE_AUTHORITY => {
            protocol_state.oracle_update_authority = ctx.accounts.target_account.key();
            msg!("Oracle authority role added to: {}", ctx.accounts.target_account.key());
        }
        ROLE_GOVERNANCE => {
            protocol_state.governance_pubkey = ctx.accounts.target_account.key();
            msg!("Governance role added to: {}", ctx.accounts.target_account.key());
        }
        _ => return Err(AegisError::Unauthorized.into()),
    }

    protocol_state.updated_at = clock.unix_timestamp;

    Ok(())
}
