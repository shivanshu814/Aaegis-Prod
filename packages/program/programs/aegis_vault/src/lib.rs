use anchor_lang::prelude::*;

declare_id!("8nj2vusE752EDbTE8mWJZ2qQsPohrrkBpwqKgMxJysyw");

#[program]
pub mod aegis_vault {
    use super::*;

    // Initialize the message account and store a message string.
    // This makes the program accept input (message) and persist it on-chain.
    pub fn initialize(ctx: Context<Initialize>, message: String) -> Result<()> {
        let msg_account = &mut ctx.accounts.message_account;
        msg!("Initializing message account for program: {:?}", ctx.program_id);
        msg!("Storing message: {}", message);
        msg_account.message = message;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 4 + 280)]
    pub message_account: Account<'info, MessageAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Simple account to hold a string message.
#[account]
pub struct MessageAccount {
    pub message: String,
}
