"use client";

import { Info, Lock, Shield, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import type {
    BackendOracleData,
    BackendProtocolStateData,
    BackendVaultData,
} from "../../../../types";
import {
    calculateMaxLTV,
    formatUSD,
    getSOLPriceUSD,
    getVaultCollateralSOL,
    getVaultDebtAGSUSD,
} from "../../../../utils";

interface CollateralDetailsProps {
    vault: BackendVaultData | null;
    oracle: BackendOracleData | null;
    protocolState: BackendProtocolStateData | null;
}

const CollateralDetails = ({ vault, oracle, protocolState }: CollateralDetailsProps) => {
    const { collateralSOL, collateralValueUSD, solPrice, maxLTV, utilizationPercent } = useMemo(() => {
        const collateralSOL = getVaultCollateralSOL(vault);
        const debtAGSUSD = getVaultDebtAGSUSD(vault);
        const solPrice = getSOLPriceUSD(oracle);
        const collateralValueUSD = collateralSOL * solPrice;
        const maxLTV = calculateMaxLTV(protocolState);

        // Calculate how much of max borrowing capacity is used
        const maxBorrowable = collateralValueUSD * (maxLTV / 100);
        const utilizationPercent = maxBorrowable > 0 ? (debtAGSUSD / maxBorrowable) * 100 : 0;

        return { collateralSOL, collateralValueUSD, solPrice, maxLTV, utilizationPercent };
    }, [vault, oracle, protocolState]);

    return (
        <div className="rounded-xl p-6 bg-gray-800/50 border border-white/10 animate-slide-up">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/20">
                    <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Collateral Details</h3>
            </div>

            {/* Main Collateral Display */}
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <img
                                src="https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png"
                                alt="SOL"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-white">{collateralSOL.toFixed(4)} SOL</div>
                            <div className="text-sm text-white/60">Solana</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-white">{formatUSD(collateralValueUSD)}</div>
                        <div className="text-sm text-white/60">@ {formatUSD(solPrice)}/SOL</div>
                    </div>
                </div>
            </div>

            {/* Utilization Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">Borrowing Capacity Used</span>
                    <span className="text-sm font-semibold text-white">{utilizationPercent.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${utilizationPercent > 80 ? 'bg-red-500' :
                            utilizationPercent > 60 ? 'bg-yellow-500' : 'bg-emerald-500'
                            }`}
                        style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                    />
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1 mb-1">
                        <Lock className="w-3 h-3 text-white/60" />
                        <span className="text-xs text-white/60">Locked Value</span>
                    </div>
                    <div className="text-sm font-semibold text-white">{formatUSD(collateralValueUSD)}</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-white/60" />
                        <span className="text-xs text-white/60">Max LTV</span>
                    </div>
                    <div className="text-sm font-semibold text-white">{maxLTV.toFixed(0)}%</div>
                </div>
            </div>

            {/* Info Note */}
            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-300/80">
                    Your SOL collateral secures your borrowed AGSUSD. Maintain healthy collateral levels to avoid liquidation.
                </p>
            </div>
        </div>
    );
};

export default CollateralDetails;
