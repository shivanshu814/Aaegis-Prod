import { BarChart3, DollarSign } from "lucide-react";

interface VaultStatsProps {
  vaultCollateral: number;
  vaultDebt: number;
  collateralRatio: number;
}

const VaultStats = ({
  vaultCollateral,
  vaultDebt,
  collateralRatio,
}: VaultStatsProps) => {
  // Calculate collateral value (assuming price is $1 per SOL for this example)
  const collateralValue = vaultCollateral * 1; // Replace with actual price feed

  // Calculate liquidation price (simplified example)
  const liquidationPrice =
    vaultCollateral > 0 ? (vaultDebt * 1.5) / vaultCollateral : 0;

  const getRatioColor = (ratio: number) => {
    if (ratio < 150) return "text-red-400";
    if (ratio < 200) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="rounded-xl p-6 glass border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Vault Statistics</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Total Collateral (SOL)</span>
          <span className="text-sm font-semibold text-white">
            {vaultCollateral.toFixed(4)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/70">Collateral Value (USD)</span>
          </div>
          <span className="text-sm font-semibold text-white">
            ${collateralValue.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Debt (AGS)</span>
          <span className="text-sm font-semibold text-white">
            {vaultDebt.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Collateral Ratio</span>
          <span
            className={`text-sm font-semibold ${getRatioColor(collateralRatio)}`}
          >
            {collateralRatio.toFixed(2)}%
          </span>
        </div>

        <div className="pt-4 mt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-white/70">Liquidation Price</span>
            <span className="text-sm font-semibold text-white">
              ${liquidationPrice.toFixed(2)}
            </span>
          </div>
          <p className="mt-2 text-xs text-white/50">
            If SOL price goes below this, your position may be liquidated
          </p>
        </div>
      </div>
    </div>
  );
};

export default VaultStats;
