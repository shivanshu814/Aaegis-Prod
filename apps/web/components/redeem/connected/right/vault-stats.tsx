import { DollarSign, Shield, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import type {
  BackendOracleData,
  BackendProtocolStateData,
  BackendVaultData,
} from "../../../../types";
import {
  calculateCollateralRatioFromAmounts,
  calculateCollateralValueUSD,
  formatAGSUSD,
  formatSOL,
  formatUSD,
  getSOLPriceUSD,
  getVaultCollateralSOL,
  getVaultDebtAGSUSD,
} from "../../../../utils";
import { getCollateralRatioColor } from "../../../../utils/helpers";

interface VaultStatsProps {
  vault: BackendVaultData | null;
  oracle: BackendOracleData | null;
  protocolState: BackendProtocolStateData | null;
}

const VaultStats = ({ vault, oracle, protocolState }: VaultStatsProps) => {
  const vaultCollateral = useMemo(() => getVaultCollateralSOL(vault), [vault]);
  const vaultDebt = useMemo(() => getVaultDebtAGSUSD(vault), [vault]);

  const collateralValueUSD = useMemo(
    () => calculateCollateralValueUSD(vaultCollateral, oracle),
    [vaultCollateral, oracle]
  );

  const currentCollateralRatio = useMemo(
    () =>
      calculateCollateralRatioFromAmounts(vaultCollateral, vaultDebt, oracle),
    [vaultCollateral, vaultDebt, oracle]
  );

  const solPriceUSD = getSOLPriceUSD(oracle);

  const getRatioColor = (ratio: number | string): string => {
    return getCollateralRatioColor(ratio);
  };

  return (
    <div className="rounded-xl p-6 bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Your Position</h3>
      </div>

      <div className="space-y-4">
        {/* Collateral */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">Collateral Deposited</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatSOL(vaultCollateral)} SOL
          </div>
          <div className="text-sm text-white/60">
            {formatUSD(collateralValueUSD)}
          </div>
        </div>

        {/* Debt */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">AGSUSD Minted</span>
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatAGSUSD(vaultDebt)} AGSUSD
          </div>
          <div className="text-sm text-white/60">
            ≈ ${formatAGSUSD(vaultDebt)}
          </div>
        </div>

        {/* Collateral Ratio */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">Collateral Ratio</span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <div
            className={`text-2xl font-bold mb-1 ${getRatioColor(currentCollateralRatio)}`}
          >
            {currentCollateralRatio === Infinity
              ? "∞"
              : `${currentCollateralRatio.toFixed(1)}%`}
          </div>
          <div className="text-sm text-white/60">
            Min Required:{" "}
            {protocolState
              ? `${(Number(protocolState.collateralRatioBps) / 10000) * 100}%`
              : "150%"}
          </div>
        </div>

        {/* SOL Price */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20">
          <div className="text-sm text-white/60 mb-2">SOL Price</div>
          <div className="text-xl font-bold text-white">
            {solPriceUSD > 0 ? `$${solPriceUSD.toFixed(2)}` : "Loading..."}
          </div>
        </div>
      </div>
    </div>
  );
};
export default VaultStats;
