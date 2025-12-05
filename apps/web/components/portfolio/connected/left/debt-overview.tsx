"use client";

import { AlertTriangle, Coins, Percent } from "lucide-react";
import { useMemo } from "react";
import type {
    BackendOracleData,
    BackendProtocolStateData,
    BackendVaultData,
} from "../../../../types";
import {
    calculateAvailableToBorrow,
    calculateLTVFromAmounts,
    calculateMaxLTV,
    formatUSD,
    getVaultCollateralSOL,
    getVaultDebtAGSUSD
} from "../../../../utils";

interface DebtOverviewProps {
    vault: BackendVaultData | null;
    oracle: BackendOracleData | null;
    protocolState: BackendProtocolStateData | null;
}

const DebtOverview = ({ vault, oracle, protocolState }: DebtOverviewProps) => {
    const { debtAGSUSD, currentLTV, maxLTV, availableToBorrow, isAtRisk } = useMemo(() => {
        const collateralSOL = getVaultCollateralSOL(vault);
        const debtAGSUSD = getVaultDebtAGSUSD(vault);

        console.log("💰 [Debt Overview] Raw Values:", {
            vault,
            collateralSOL,
            debtAGSUSD,
            oracle,
            protocolState
        });

        const currentLTV = calculateLTVFromAmounts(collateralSOL, debtAGSUSD, oracle);
        const maxLTV = calculateMaxLTV(protocolState);
        const availableToBorrow = calculateAvailableToBorrow(collateralSOL, debtAGSUSD, oracle, protocolState);
        const isAtRisk = currentLTV >= maxLTV * 0.85;

        console.log("💰 [Debt Overview] Calculated Values:", {
            debtAGSUSD,
            currentLTV,
            maxLTV,
            availableToBorrow,
            isAtRisk
        });

        return { debtAGSUSD, currentLTV, maxLTV, availableToBorrow, isAtRisk };
    }, [vault, oracle, protocolState]);

    // Calculate borrow fee
    const borrowFeePercent = useMemo(() => {
        if (!protocolState) {
            console.log("💸 [Borrow Fee] No protocol state, using default 0.5%");
            return 0.5;
        }
        const mintFeeBps = Number(protocolState.mintFeeBps) || 50;
        const feePercent = mintFeeBps / 100;

        console.log("💸 [Borrow Fee] Calculated:", {
            protocolState,
            mintFeeBps,
            feePercent: feePercent + "%"
        });

        return feePercent;
    }, [protocolState]);

    return (
        <div className="rounded-xl p-6 bg-gray-800/50 border border-white/10 animate-slide-up">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-orange-500/20">
                    <Coins className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Debt Overview</h3>
                {isAtRisk && (
                    <div className="ml-auto flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        High LTV
                    </div>
                )}
            </div>

            {/* Main Debt Display */}
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <img
                                src="https://avatars.githubusercontent.com/u/235737903?s=400&u=a850ac2de9d74b1f2712f875a2fed01172feef4a&v=4"
                                alt="AGSUSD"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-white">{debtAGSUSD.toFixed(2)} AGSUSD</div>
                            <div className="text-sm text-white/60">Outstanding Debt</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-white">{formatUSD(debtAGSUSD)}</div>
                        <div className="text-sm text-white/60">USD Value</div>
                    </div>
                </div>
            </div>

            {/* LTV Progress */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">Current LTV</span>
                    <span className={`text-sm font-semibold ${isAtRisk ? 'text-red-400' : 'text-white'}`}>
                        {currentLTV.toFixed(1)}% / {maxLTV.toFixed(0)}%
                    </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
                    {/* Max LTV Marker */}
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                        style={{ left: `${Math.min(100, (maxLTV / 100) * 100)}%` }}
                    />
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${currentLTV >= maxLTV ? 'bg-red-500' :
                            currentLTV >= maxLTV * 0.85 ? 'bg-yellow-500' : 'bg-emerald-500'
                            }`}
                        style={{ width: `${Math.min((currentLTV / 100) * 100, 100)}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-xs text-white/40">0%</span>
                    <span className="text-xs text-red-400">Max: {maxLTV.toFixed(0)}%</span>
                    <span className="text-xs text-white/40">100%</span>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1 mb-1">
                        <Coins className="w-3 h-3 text-emerald-400" />
                        <span className="text-xs text-white/60">Available to Borrow</span>
                    </div>
                    <div className="text-sm font-semibold text-emerald-400">
                        {availableToBorrow > 0 ? formatUSD(availableToBorrow) : '$0.00'}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1 mb-1">
                        <Percent className="w-3 h-3 text-white/60" />
                        <span className="text-xs text-white/60">Borrow Fee</span>
                    </div>
                    <div className="text-sm font-semibold text-white">{borrowFeePercent.toFixed(2)}%</div>
                </div>
            </div>
        </div>
    );
};

export default DebtOverview;
