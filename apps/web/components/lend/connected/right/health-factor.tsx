"use client";

import { Info } from "lucide-react";
import { useMemo } from "react";
import type {
  BackendOracleData,
  BackendProtocolStateData,
  BackendVaultData,
} from "../../../../types";
import {
  calculateHealthFactor,
  calculateLiquidationPriceFromState,
  formatUSD,
  getHealthFactorRisk,
  getSOLPriceUSD,
  getVaultCollateralSOL,
  getVaultDebtAGSUSD,
} from "../../../../utils";

interface HealthFactorProps {
  vault: BackendVaultData | null;
  oracle: BackendOracleData | null;
  protocolState: BackendProtocolStateData | null;
  totalCollateralSOL: number;
  totalDebtAGSUSD: number;
}

const HealthFactor = ({
  vault,
  oracle,
  protocolState,
  totalCollateralSOL,
  totalDebtAGSUSD,
}: HealthFactorProps) => {
  // Get current values from vault
  const currentCollateralSOL = useMemo(
    () => getVaultCollateralSOL(vault),
    [vault]
  );
  const currentDebtAGSUSD = useMemo(() => getVaultDebtAGSUSD(vault), [vault]);

  // Calculate health factor and related metrics
  const {
    normalizedHealthFactor,
    healthFactorRisk,
    liquidationPrice,
    solPriceUSD,
    collateralRatio,
    healthFactorPercentage,
  } = useMemo(() => {
    const normalizedHealthFactor = calculateHealthFactor(
      totalCollateralSOL,
      totalDebtAGSUSD,
      oracle,
      protocolState
    );
    const healthFactorRisk = getHealthFactorRisk(normalizedHealthFactor);
    const liquidationPrice = calculateLiquidationPriceFromState(
      currentCollateralSOL,
      currentDebtAGSUSD,
      protocolState
    );
    const solPriceUSD = getSOLPriceUSD(oracle);
    const collateralRatio =
      totalDebtAGSUSD > 0
        ? (totalCollateralSOL * solPriceUSD) / totalDebtAGSUSD
        : Infinity;
    // Calculate percentage for progress bar (0-100%)
    // Health factor ranges from 0 to 4
    const healthFactorPercentage = Math.min(
      100,
      (normalizedHealthFactor / 4) * 100
    );
    return {
      normalizedHealthFactor,
      healthFactorRisk,
      liquidationPrice,
      solPriceUSD,
      collateralRatio,
      healthFactorPercentage,
    };
  }, [
    totalCollateralSOL,
    totalDebtAGSUSD,
    oracle,
    protocolState,
    currentCollateralSOL,
    currentDebtAGSUSD,
  ]);

  // Get color based on health factor
  const getHealthFactorTextColor = () => {
    if (normalizedHealthFactor >= 2.5) return "text-green-400";
    if (normalizedHealthFactor >= 1.75) return "text-yellow-400";
    if (normalizedHealthFactor > 0) return "text-orange-400";
    return "text-red-400";
  };

  // Get progress bar color based on health factor
  const getProgressBarColor = () => {
    if (normalizedHealthFactor >= 2.5) return "bg-green-500";
    if (normalizedHealthFactor >= 1.75) return "bg-yellow-500";
    if (normalizedHealthFactor > 0) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="rounded-xl p-6 bg-gray-800/50 border border-white/10 animate-slide-up">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-semibold text-white">Health factor</h3>
        <Info className="w-4 h-4 text-white/60" />
      </div>

      {/* Health Factor Display */}
      <div className="mb-6">
        {/* Concentric Circles Gauge */}
        <div className="relative w-full max-w-xs mx-auto mb-6">
          {/* Outer Circle Container */}
          <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden">
              {/* Full Circle Container */}
              <div className="relative w-full aspect-square">
                {/* Big Outer Circle - Dynamic Color */}
                <div
                  className={`absolute inset-0 rounded-full ${getProgressBarColor()} transition-colors duration-300`}
                />
                {/* Small Inner Circle */}
                <div
                  className="absolute rounded-full overflow-hidden"
                  style={{
                    width: "80%",
                    height: "80%",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1,
                    border: "10px solid rgba(16, 21, 30, 1)",
                    background: `
                      conic-gradient(
                          green 180deg 240deg,
                          red 240deg 320deg,
                          yellow 320deg 360deg,
                          transparent 0deg 180deg
                        )
                    `,
                    padding: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "rgba(16, 21, 30, 1)",
                      borderRadius: "50%",
                    }}
                  />
                </div>

                {/* Center Value Display */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  {(normalizedHealthFactor > 0 || totalDebtAGSUSD === 0) && (
                    <span
                      className={`inline-flex mt-18 mb-3 items-center px-3 py-1 rounded-full text-xs font-semibold ${healthFactorRisk.color}`}
                    >
                      {healthFactorRisk.label}
                    </span>
                  )}
                  <div
                    className={`text-5xl font-bold ${getHealthFactorTextColor()} transition-colors duration-300`}
                  >
                    {totalDebtAGSUSD === 0
                      ? "4.00"
                      : normalizedHealthFactor > 0
                        ? normalizedHealthFactor.toFixed(2)
                        : "0.00"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scale Labels */}
          <div className="relative -mt-32">
            <div className="flex justify-between text-xs text-white/60">
              <span>0</span>
              <span>1</span>
              <span>1.75</span>
              <span>2.5</span>
              <span>4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Liquidation Price */}
      <div className="flex items-center justify-between py-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-white/60" />
          <span className="text-sm text-white/80">Liquidation Price</span>
        </div>
        <span className="text-sm font-semibold text-white">
          {liquidationPrice > 0
            ? formatUSD(liquidationPrice)
            : currentDebtAGSUSD === 0
              ? "No Debt"
              : currentCollateralSOL === 0
                ? "No Collateral"
                : "N/A"}
        </span>
      </div>

      {/* Current SOL Price */}
      <div className="flex items-center justify-between py-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-white/60" />
          <span className="text-sm text-white/80">Current SOL Price</span>
        </div>
        <span className="text-sm font-semibold text-white">
          {solPriceUSD > 0 ? formatUSD(solPriceUSD) : "Loading..."}
        </span>
      </div>
    </div>
  );
};
export default HealthFactor;
