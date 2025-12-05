"use client";

import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import type {
    BackendOracleData,
    BackendVaultData,
} from "../../../../types";
import {
    formatUSD,
    getSOLPriceUSD,
    getVaultCollateralSOL,
    getVaultDebtAGSUSD,
} from "../../../../utils";

interface PortfolioSummaryProps {
    vault: BackendVaultData | null;
    oracle: BackendOracleData | null;
}

const PortfolioSummary = ({ vault, oracle }: PortfolioSummaryProps) => {
    const { collateralSOL, debtAGSUSD, collateralValueUSD, netWorthUSD, solPrice } = useMemo(() => {
        const collateralSOL = getVaultCollateralSOL(vault);
        const debtAGSUSD = getVaultDebtAGSUSD(vault);
        const solPrice = getSOLPriceUSD(oracle);
        const collateralValueUSD = collateralSOL * solPrice;
        const netWorthUSD = collateralValueUSD - debtAGSUSD;
        return { collateralSOL, debtAGSUSD, collateralValueUSD, netWorthUSD, solPrice };
    }, [vault, oracle]);

    const isPositive = netWorthUSD >= 0;

    return (
        <div className="rounded-xl p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-white/10 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Portfolio Overview</h3>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isPositive ? 'Healthy' : 'At Risk'}
                </div>
            </div>

            {/* Net Worth - Main Highlight */}
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-emerald-500/20">
                <div className="text-sm text-white/60 mb-1">Net Worth</div>
                <div className={`text-3xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatUSD(netWorthUSD)}
                </div>
                <div className="text-xs text-white/50 mt-1">
                    Collateral Value - Outstanding Debt
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Total Collateral */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                            <img
                                src="https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png"
                                alt="SOL"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-xs text-white/60">Collateral</span>
                    </div>
                    <div className="text-xl font-bold text-white">{collateralSOL.toFixed(4)} SOL</div>
                    <div className="text-xs text-white/50">{formatUSD(collateralValueUSD)}</div>
                </div>

                {/* Total Debt */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                            <img
                                src="https://avatars.githubusercontent.com/u/235737903?s=400&u=a850ac2de9d74b1f2712f875a2fed01172feef4a&v=4"
                                alt="AGSUSD"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-xs text-white/60">Debt</span>
                    </div>
                    <div className="text-xl font-bold text-white">{debtAGSUSD.toFixed(2)} AGSUSD</div>
                    <div className="text-xs text-white/50">{formatUSD(debtAGSUSD)}</div>
                </div>
            </div>

            {/* SOL Price */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-white/60" />
                    <span className="text-sm text-white/60">SOL Price</span>
                </div>
                <span className="text-sm font-semibold text-white">{formatUSD(solPrice)}</span>
            </div>
        </div>
    );
};

export default PortfolioSummary;
