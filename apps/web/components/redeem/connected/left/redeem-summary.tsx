import { TrendingUp } from "lucide-react";
import type {
  BackendOracleData,
  BackendProtocolStateData,
  BackendVaultData,
} from "../../../../types";
import {
  calculateNewCollateralRatio,
  calculateRedeemFee,
  formatAGSUSD,
  formatSOL,
} from "../../../../utils";
import { getCollateralRatioColor } from "../../../../utils/helpers";

interface RedeemSummaryProps {
  vault: BackendVaultData | null;
  oracle: BackendOracleData | null;
  protocolState: BackendProtocolStateData | null;
  agsAmount: string;
  solAmount: string;
  vaultDebt: number;
  vaultCollateral: number;
}

const RedeemSummary = ({
  vault,
  oracle,
  protocolState,
  agsAmount,
  solAmount,
  vaultDebt,
  vaultCollateral,
}: RedeemSummaryProps) => {
  if (!agsAmount || !solAmount) return null;

  const ags = parseFloat(agsAmount) || 0;
  const sol = parseFloat(solAmount) || 0;

  const redeemFee = calculateRedeemFee(ags, protocolState);
  const newCollateralRatio = calculateNewCollateralRatio(
    vaultCollateral,
    vaultDebt,
    sol,
    ags,
    oracle
  );

  const getRatioColor = (ratio: number | string): string => {
    return getCollateralRatioColor(ratio);
  };

  return (
    <div className="rounded-xl p-6 bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">
          Transaction Summary
        </h3>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Burn AGSUSD:</span>
          <span className="text-white font-semibold">
            {formatAGSUSD(ags)} AGSUSD
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Withdraw SOL:</span>
          <span className="text-white font-semibold">{formatSOL(sol)} SOL</span>
        </div>
        {protocolState && (
          <div className="flex justify-between text-sm">
            <span className="text-white/60">
              Redeem Fee ({(Number(protocolState.redeemFeeBps) / 10000) * 100}
              %):
            </span>
            <span className="text-white font-semibold">
              {formatAGSUSD(redeemFee, 4)} AGSUSD
            </span>
          </div>
        )}
        <div className="border-t border-white/10 pt-3">
          <div className="flex justify-between">
            <span className="text-white/60">New Collateral Ratio:</span>
            <span
              className={`font-semibold ${getRatioColor(newCollateralRatio)}`}
            >
              {newCollateralRatio === Infinity
                ? "∞"
                : `${newCollateralRatio.toFixed(1)}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RedeemSummary;
