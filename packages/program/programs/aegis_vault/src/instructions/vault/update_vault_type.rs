use anchor_lang::prelude::*;
use crate::state::{ProtocolState, VaultType};
use crate::constants::seeds::{PROTOCOL_STATE_SEED, VAULT_TYPE_SEED};

#[derive(Accounts)]
pub struct UpdateVaultType<'info> {
    #[account(
        mut,
        seeds = [VAULT_TYPE_SEED, vault_type.collateral_mint.key().as_ref()],
        bump
    )]
    pub vault_type: Account<'info, VaultType>,

    #[account(
        seeds = [PROTOCOL_STATE_SEED],
        bump,
        constraint = protocol_state.admin_pubkey == admin.key(),
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    pub admin: Signer<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct UpdateVaultTypeParams {
    pub oracle_price_account: Option<Pubkey>,
    pub ltv_bps: Option<u64>,
    pub liq_threshold_bps: Option<u64>,
    pub liq_penalty_bps: Option<u64>,
    pub stability_fee_bps: Option<u16>,
    pub mint_fee_bps: Option<u16>,
    pub redeem_fee_bps: Option<u16>,
    pub vault_debt_ceiling: Option<u64>,
}

pub fn handler(
    ctx: Context<UpdateVaultType>,
    params: UpdateVaultTypeParams,
) -> Result<()> {
    let vault_type = &mut ctx.accounts.vault_type;
    let clock = Clock::get()?;

    if let Some(oracle) = params.oracle_price_account {
        vault_type.oracle_price_account = oracle;
    }
    if let Some(ltv) = params.ltv_bps {
        vault_type.ltv_bps = ltv;
    }
    if let Some(threshold) = params.liq_threshold_bps {
        vault_type.liq_threshold_bps = threshold;
    }
    if let Some(penalty) = params.liq_penalty_bps {
        vault_type.liq_penalty_bps = penalty;
    }
    if let Some(fee) = params.stability_fee_bps {
        vault_type.stability_fee_bps = fee;
    }
    if let Some(fee) = params.mint_fee_bps {
        vault_type.mint_fee_bps = fee;
    }
    if let Some(fee) = params.redeem_fee_bps {
        vault_type.redeem_fee_bps = fee;
    }
    if let Some(ceiling) = params.vault_debt_ceiling {
        vault_type.vault_debt_ceiling = ceiling;
    }

    vault_type.updated_at = clock.unix_timestamp;

    msg!("Vault Type Updated: {}", vault_type.collateral_mint);
    Ok(())
}
