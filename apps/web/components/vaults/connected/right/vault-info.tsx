import { Info, TrendingUp } from "lucide-react";

interface VaultInfoProps {
  collateralRatio: number;
  liquidationPrice: number;
  oraclePrice: number;
}

const VaultInfo = ({
  collateralRatio,
  liquidationPrice,
  oraclePrice,
}: VaultInfoProps) => {
  // Determine the color based on the collateral ratio
  const getRatioColor = (ratio: number) => {
    if (ratio < 150) return "text-red-400";
    if (ratio < 200) return "text-yellow-400";
    return "text-green-400";
  };

  const getProgressColor = (ratio: number) => {
    if (ratio < 150) return "bg-red-500";
    if (ratio < 200) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  return (
    <div className="rounded-xl p-6 glass border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">Vault Information</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/70">Collateral Ratio</span>
            <span
              className={`text-sm font-semibold ${getRatioColor(collateralRatio)}`}
            >
              {collateralRatio.toFixed(2)}%
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(collateralRatio)} transition-all duration-500`}
              style={{ width: `${Math.min(collateralRatio / 2, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-white/50">0%</span>
            <span className="text-xs text-white/50">200%</span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Liquidation Price</span>
            <span className="text-sm font-semibold text-white">
              ${liquidationPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white/70">Current Price</span>
            </div>
            <span className="text-sm font-semibold text-white">
              ${oraclePrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultInfo;
