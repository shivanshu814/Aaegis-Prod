"use client";

import { useMemo } from "react";
import type {
  BackendOracleData,
  BackendProtocolStateData,
  BackendVaultData,
} from "../../../../types";
import {
  calculateAvailableToBorrow,
  calculateBorrowRatePercent,
  calculateCollateralValueUSD,
  formatAGSUSD,
  formatSOL,
  formatUSD,
  getVaultDebtAGSUSD,
} from "../../../../utils";

interface BorrowRateProps {
  vault: BackendVaultData | null;
  oracle: BackendOracleData | null;
  protocolState: BackendProtocolStateData | null;
  totalCollateralSOL: number;
  totalDebtAGSUSD: number;
}

const BorrowRate = ({
  vault,
  oracle,
  protocolState,
  totalCollateralSOL,
  totalDebtAGSUSD,
}: BorrowRateProps) => {
  // Get current debt from vault
  const currentDebtAGSUSD = useMemo(() => getVaultDebtAGSUSD(vault), [vault]);

  // Calculate metrics
  const { borrowRatePercent, totalCollateralValueUSD, availableToBorrow } =
    useMemo(() => {
      const borrowRatePercent = calculateBorrowRatePercent(protocolState);
      const totalCollateralValueUSD = calculateCollateralValueUSD(
        totalCollateralSOL,
        oracle
      );
      const availableToBorrow = calculateAvailableToBorrow(
        totalCollateralSOL,
        currentDebtAGSUSD,
        oracle,
        protocolState
      );
      return {
        borrowRatePercent,
        totalCollateralValueUSD,
        availableToBorrow,
      };
    }, [protocolState, totalCollateralSOL, oracle, currentDebtAGSUSD]);

  return (
    <div className="rounded-xl p-6 bg-gray-800/50 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-white/5">
          <img
            src="https://avatars.githubusercontent.com/u/235737903?s=400&u=a850ac2de9d74b1f2712f875a2fed01172feef4a&v=4"
            alt="AGSUSD"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-lg font-semibold text-white">Borrow Rate</h3>
      </div>
      <div className="text-5xl font-bold text-white mb-2">
        {borrowRatePercent.toFixed(2)}%
      </div>
      <div className="text-sm text-white/60">Annual Percentage Rate (APR)</div>
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Collateral:</span>
            <span className="text-white font-semibold">
              {formatSOL(totalCollateralSOL)} SOL
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Collateral Value:</span>
            <span className="text-white font-semibold">
              {formatUSD(totalCollateralValueUSD)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Total Debt:</span>
            <span className="text-white font-semibold">
              {formatAGSUSD(totalDebtAGSUSD)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Available:</span>
            <span className="text-green-400 font-semibold">
              {formatAGSUSD(Math.max(0, availableToBorrow))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BorrowRate;
