use anchor_lang::prelude::*;
use crate::state::ProtocolState;
use crate::constants::seeds::PROTOCOL_STATE_SEED;
use crate::errors::codes::AegisError;

#[derive(Accounts)]
pub struct SetStablecoinMint<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_STATE_SEED],
        bump,
        has_one = admin_pubkey @ AegisError::Unauthorized
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    pub admin_pubkey: Signer<'info>,
}

pub fn handler(
    ctx: Context<SetStablecoinMint>,
    stablecoin_mint: Pubkey,
) -> Result<()> {
    let protocol_state = &mut ctx.accounts.protocol_state;

    // Derive and verify mint authority PDA
    let (mint_authority_pda, bump) = Pubkey::find_program_address(
        &[b"mint_authority"],
        ctx.program_id,
    );

    // Set stablecoin mint and bump
    protocol_state.stablecoin_mint = stablecoin_mint;
    protocol_state.mint_authority_bump = bump;

    // Derive treasury ATA
    let treasury_ata = anchor_spl::associated_token::get_associated_token_address(
        &protocol_state.treasury_pubkey,
        &stablecoin_mint,
    );
    protocol_state.treasury_ata = treasury_ata;

    // Update timestamp
    let clock = Clock::get()?;
    protocol_state.updated_at = clock.unix_timestamp;

    msg!("Stablecoin mint set: {}", stablecoin_mint);
    msg!("Mint authority PDA: {}", mint_authority_pda);
    msg!("Mint authority bump: {}", bump);
    msg!("Treasury ATA: {}", treasury_ata);
    msg!("⚠️ IMPORTANT: Transfer mint authority of {} to {}", stablecoin_mint, mint_authority_pda);
    msg!("⚠️ IMPORTANT: Create ATA {} for treasury if it doesn't exist", treasury_ata);

    Ok(())
}
