import { Info, Minus } from "lucide-react";
import { useCallback, useMemo } from "react";
import type {
  BackendOracleData,
  BackendProtocolStateData,
  BackendVaultData,
} from "../../../../types";
import {
  calculateRedeemFee,
  formatAGSUSD,
  getVaultDebtAGSUSD,
} from "../../../../utils";

interface BurnProps {
  isSDKReady: boolean;
  vault: BackendVaultData | null;
  oracle: BackendOracleData | null;
  protocolState: BackendProtocolStateData | null;
  agsAmount: string;
  setAgsAmount: (value: string) => void;
  agsusdBalance: string;
}

const Burn = ({
  isSDKReady,
  vault,
  oracle,
  protocolState,
  agsAmount,
  setAgsAmount,
  agsusdBalance,
}: BurnProps) => {
  // Get current debt AGSUSD from vault
  const currentDebtAGSUSD = useMemo(() => getVaultDebtAGSUSD(vault), [vault]);

  // Calculate redeem fee
  const redeemFee = useMemo(
    () => calculateRedeemFee(parseFloat(agsAmount) || 0, protocolState),
    [agsAmount, protocolState]
  );

  // Handle AGS amount change
  const handleAgsAmountChange = useCallback(
    (value: string) => {
      setAgsAmount(value);
    },
    [setAgsAmount]
  );

  // Handle percentage button clicks
  const handlePercentageClick = useCallback(
    (percentage: number) => {
      if (currentDebtAGSUSD <= 0) return;
      const amount = (currentDebtAGSUSD * percentage) / 100;
      handleAgsAmountChange(amount.toFixed(2));
    },
    [currentDebtAGSUSD, handleAgsAmountChange]
  );

  // Handle Max button click
  const handleMaxClick = useCallback(() => {
    if (currentDebtAGSUSD <= 0) return;
    handleAgsAmountChange(currentDebtAGSUSD.toFixed(2));
  }, [currentDebtAGSUSD, handleAgsAmountChange]);

  // Determine which button is selected based on current amount
  const getSelectedPercentage = () => {
    const amount = parseFloat(agsAmount) || 0;
    if (currentDebtAGSUSD <= 0) return null;
    const percentage = (amount / currentDebtAGSUSD) * 100;
    if (Math.abs(percentage - 100) < 0.1) return "max";
    if (Math.abs(percentage - 75) < 0.1) return 75;
    if (Math.abs(percentage - 50) < 0.1) return 50;
    if (Math.abs(percentage - 25) < 0.1) return 25;
    return null;
  };

  const selectedPercentage = useMemo(getSelectedPercentage, [
    agsAmount,
    currentDebtAGSUSD,
  ]);

  return (
    <div className="rounded-xl p-6 bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-white">Burn AGSUSD</h2>
          <div className="relative group">
            <Info className="w-4 h-4 text-white/60 cursor-help hover:text-white/80 transition-colors" />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64">
              <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl border border-white/10">
                <div className="font-semibold mb-1 text-white">
                  Burn AGSUSD Tokens
                </div>
                <div className="text-white/70 leading-relaxed">
                  Burn AGSUSD stablecoins to reduce your debt and unlock your
                  SOL collateral for withdrawal.
                </div>
                <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            const input = document.querySelector(
              'input[placeholder="0.00"]'
            ) as HTMLInputElement;
            if (input) input.focus();
          }}
          className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
        >
          <Minus className="w-4 h-4" />
          Burn more
        </button>
      </div>

      <div className="space-y-4">
        {/* Asset Selector */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white/5">
            <img
              src="/logo-mark-protocol.svg"
              alt="AGSUSD"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="text-sm text-white/60">Asset</div>
            <div className="text-white font-semibold">AGSUSD</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/60">Minted</div>
            <div className="text-white font-semibold">
              {formatAGSUSD(currentDebtAGSUSD)}
            </div>
          </div>
        </div>

        {/* Burn Amount Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-white/60">Amount to Burn</label>
            {currentDebtAGSUSD > 0 && (
              <span className="text-xs text-white/40">
                Available: {formatAGSUSD(currentDebtAGSUSD)}
              </span>
            )}
          </div>
          <input
            type="number"
            placeholder="0.00"
            value={agsAmount}
            onChange={(e) => handleAgsAmountChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50"
            disabled={!isSDKReady}
          />
          {/* Quick Select Buttons */}
          {currentDebtAGSUSD > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => handlePercentageClick(25)}
                disabled={!isSDKReady}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedPercentage === 25
                    ? "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 hover:text-green-300"
                    : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => handlePercentageClick(50)}
                disabled={!isSDKReady}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedPercentage === 50
                    ? "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 hover:text-green-300"
                    : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => handlePercentageClick(75)}
                disabled={!isSDKReady}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedPercentage === 75
                    ? "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 hover:text-green-300"
                    : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                75%
              </button>
              <button
                type="button"
                onClick={handleMaxClick}
                disabled={!isSDKReady}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedPercentage === "max"
                    ? "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 hover:text-green-300"
                    : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                Max
              </button>
            </div>
          )}
          {/* AGSUSD Balance */}
          {agsusdBalance && (
            <div className="mt-2 text-sm text-white/60">
              Wallet Balance: {agsusdBalance} AGSUSD
            </div>
          )}
        </div>

        {/* Redeem Fee Info */}
        {protocolState && agsAmount && (
          <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-sm text-white/60">
              Redeem Fee ({(Number(protocolState.redeemFeeBps) / 10000) * 100}
              %):
            </span>
            <span className="text-white font-semibold">
              {formatAGSUSD(redeemFee, 4)} AGSUSD
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
export default Burn;
