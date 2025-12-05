use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;
pub mod constants;
pub mod utils;

use instructions::*;

declare_id!("71Wb7tohP36AHMxCoBaSL2osriCnNuxgdRNLyM9FZRu8");

#[program]
pub mod aegis_vault {
    use super::*;

    // Protocol Management
    pub fn initialize_protocol(
        ctx: Context<InitializeProtocol>,
        treasury_pubkey: Pubkey,
    ) -> Result<()> {
        instructions::protocol::initialize::handler(ctx, treasury_pubkey)
    }

    pub fn add_role(ctx: Context<AddRole>, role_type: u8) -> Result<()> {
        instructions::protocol::add_role::handler(ctx, role_type)
    }

    pub fn remove_role(ctx: Context<RemoveRole>, role_type: u8) -> Result<()> {
        instructions::protocol::remove_role::handler(ctx, role_type)
    }

    pub fn update_feature_flags(
        ctx: Context<UpdateFeatureFlags>,
        params: UpdateFeatureFlagsParams,
    ) -> Result<()> {
        instructions::protocol::update_feature_flags::handler(ctx, params)
    }

    // Protocol Configuration Setters
    pub fn set_mint_fee_bps(
        ctx: Context<SetMintFeeBps>,
        new_mint_fee_bps: u16,
    ) -> Result<()> {
        instructions::config::set_mint_fee_bps::handler(ctx, new_mint_fee_bps)
    }

    pub fn set_redeem_fee_bps(
        ctx: Context<SetRedeemFeeBps>,
        new_redeem_fee_bps: u16,
    ) -> Result<()> {
        instructions::config::set_redeem_fee_bps::handler(ctx, new_redeem_fee_bps)
    }

    pub fn set_stability_fee_bps(
        ctx: Context<SetStabilityFeeBps>,
        new_stability_fee_bps: u16,
    ) -> Result<()> {
        instructions::config::set_stability_fee_bps::handler(ctx, new_stability_fee_bps)
    }

    pub fn set_liquidation_penalty_bps(
        ctx: Context<SetLiquidationPenaltyBps>,
        new_liquidation_penalty_bps: u64,
    ) -> Result<()> {
        instructions::config::set_liquidation_penalty_bps::handler(ctx, new_liquidation_penalty_bps)
    }

    pub fn set_collateral_ratio_bps(
        ctx: Context<SetCollateralRatioBps>,
        new_collateral_ratio_bps: u64,
    ) -> Result<()> {
        instructions::config::set_collateral_ratio_bps::handler(ctx, new_collateral_ratio_bps)
    }

    pub fn set_liquidation_threshold_bps(
        ctx: Context<SetLiquidationThresholdBps>,
        new_liquidation_threshold_bps: u64,
    ) -> Result<()> {
        instructions::config::set_liquidation_threshold_bps::handler(ctx, new_liquidation_threshold_bps)
    }

    pub fn update_treasury(ctx: Context<UpdateTreasury>, new_treasury: Pubkey) -> Result<()> {
        instructions::config::update_treasury::handler(ctx, new_treasury)
    }

    pub fn set_global_debt_ceiling(
        ctx: Context<SetGlobalDebtCeiling>,
        new_global_debt_ceiling: u64,
    ) -> Result<()> {
        instructions::config::set_global_debt_ceiling::handler(ctx, new_global_debt_ceiling)
    }

    pub fn set_default_vault_debt_ceiling(
        ctx: Context<SetDefaultVaultDebtCeiling>,
        new_ceiling: u64,
    ) -> Result<()> {
        instructions::config::set_default_vault_debt_ceiling::handler(ctx, new_ceiling)
    }

    pub fn set_oracle_ttl_seconds(
        ctx: Context<SetOracleTtlSeconds>,
        new_ttl_seconds: i64,
    ) -> Result<()> {
        instructions::config::set_oracle_ttl_seconds::handler(ctx, new_ttl_seconds)
    }

    pub fn update_oracle_authority(
        ctx: Context<UpdateOracleAuthority>,
        new_authority: Pubkey,
    ) -> Result<()> {
        instructions::config::update_oracle_authority::handler(ctx, new_authority)
    }

    pub fn set_stablecoin_mint(
        ctx: Context<SetStablecoinMint>,
        stablecoin_mint: Pubkey,
    ) -> Result<()> {
        instructions::config::set_stablecoin_mint::handler(ctx, stablecoin_mint)
    }

    // Vault Management
    pub fn create_vault_type(
        ctx: Context<CreateVaultType>,
        collateral_mint: Pubkey,
        params: CreateVaultTypeParams,
    ) -> Result<()> {
        instructions::vault::create_vault_type::handler(ctx, collateral_mint, params)
    }

    pub fn update_vault_type(
        ctx: Context<UpdateVaultType>,
        params: UpdateVaultTypeParams,
    ) -> Result<()> {
        instructions::vault::update_vault_type::handler(ctx, params)
    }

    pub fn toggle_vault_active(ctx: Context<ToggleVaultActive>) -> Result<()> {
        instructions::vault::toggle_vault_active::handler(ctx)
    }

    pub fn get_latest_price(ctx: Context<GetLatestPrice>) -> Result<u64> {
        instructions::vault::get_latest_price::handler(ctx)
    }

    // Position Management
    pub fn open_position(ctx: Context<OpenPosition>) -> Result<()> {
        instructions::position::open_position::handler(ctx)
    }

    pub fn deposit_collateral(ctx: Context<DepositCollateral>, amount: u64) -> Result<()> {
        instructions::position::deposit_collateral::handler(ctx, amount)
    }

    pub fn mint_stablecoin(ctx: Context<MintStablecoin>, amount: u64) -> Result<()> {
        instructions::position::mint_stablecoin::handler(ctx, amount)
    }

    pub fn repay_stablecoin(ctx: Context<RepayStablecoin>, amount: u64) -> Result<()> {
        instructions::position::repay_stablecoin::handler(ctx, amount)
    }

    pub fn withdraw_collateral(ctx: Context<WithdrawCollateral>, amount: u64) -> Result<()> {
        instructions::position::withdraw_collateral::handler(ctx, amount)
    }

    pub fn liquidate_position(ctx: Context<LiquidatePosition>, repay_amount: u64) -> Result<()> {
        instructions::position::liquidate_position::handler(ctx, repay_amount)
    }
}
