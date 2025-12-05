use anchor_lang::prelude::*;
use crate::state::ProtocolState;
use crate::errors::AegisError;
use crate::constants::*;

#[derive(Accounts)]
pub struct RemoveRole<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_STATE_SEED],
        bump,
        has_one = admin_pubkey @ AegisError::Unauthorized
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    pub admin_pubkey: Signer<'info>,
}

pub fn handler(ctx: Context<RemoveRole>, role_type: u8) -> Result<()> {
    let protocol_state = &mut ctx.accounts.protocol_state;
    let clock = Clock::get()?;

    // Set to default pubkey (System Program)
    match role_type {
        ROLE_GUARDIAN => {
            protocol_state.guardian_pubkey = Pubkey::default();
            msg!("Guardian role removed");
        }
        ROLE_ORACLE_AUTHORITY => {
            protocol_state.oracle_update_authority = Pubkey::default();
            msg!("Oracle authority role removed");
        }
        ROLE_GOVERNANCE => {
            protocol_state.governance_pubkey = Pubkey::default();
            msg!("Governance role removed");
        }
        _ => return Err(AegisError::Unauthorized.into()),
    }

    protocol_state.updated_at = clock.unix_timestamp;

    Ok(())
}
