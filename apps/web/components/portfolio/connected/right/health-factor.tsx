"use client";

import { Activity, Info, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
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
}

const HealthFactor = ({ vault, oracle, protocolState }: HealthFactorProps) => {
    const {
        normalizedHealthFactor,
        healthFactorRisk,
        liquidationPrice,
        solPriceUSD,
        collateralSOL,
        debtAGSUSD,
        priceDropToLiquidation,
    } = useMemo(() => {
        const collateralSOL = getVaultCollateralSOL(vault);
        const debtAGSUSD = getVaultDebtAGSUSD(vault);

        console.log("🏥 [Health Factor] Raw Values:", {
            vault,
            collateralSOL,
            debtAGSUSD,
            oracle,
            protocolState
        });

        const normalizedHealthFactor = calculateHealthFactor(
            collateralSOL,
            debtAGSUSD,
            oracle,
            protocolState
        );

        console.log("🏥 [Health Factor] Calculated Health Factor:", normalizedHealthFactor);

        const healthFactorRisk = getHealthFactorRisk(normalizedHealthFactor);
        const liquidationPrice = calculateLiquidationPriceFromState(
            collateralSOL,
            debtAGSUSD,
            protocolState
        );
        const solPriceUSD = getSOLPriceUSD(oracle);

        console.log("🏥 [Health Factor] All Calculated Values:", {
            normalizedHealthFactor,
            healthFactorRisk,
            liquidationPrice,
            solPriceUSD,
            collateralSOL,
            debtAGSUSD
        });

        // Calculate price drop percentage to liquidation
        const priceDropToLiquidation = solPriceUSD > 0 && liquidationPrice > 0
            ? ((solPriceUSD - liquidationPrice) / solPriceUSD) * 100
            : 100;

        console.log("🏥 [Health Factor] Price Drop to Liquidation:", priceDropToLiquidation + "%");

        return {
            normalizedHealthFactor,
            healthFactorRisk,
            liquidationPrice,
            solPriceUSD,
            collateralSOL,
            debtAGSUSD,
            priceDropToLiquidation,
        };
    }, [vault, oracle, protocolState]);

    // Get icon based on health factor
    const getHealthIcon = () => {
        if (normalizedHealthFactor >= 2.5) return <ShieldCheck className="w-8 h-8" />;
        if (normalizedHealthFactor >= 1.75) return <Activity className="w-8 h-8" />;
        if (normalizedHealthFactor > 1) return <ShieldAlert className="w-8 h-8" />;
        return <ShieldX className="w-8 h-8" />;
    };

    // Get color based on health factor
    const getHealthColor = () => {
        if (normalizedHealthFactor >= 2.5) return "text-green-400";
        if (normalizedHealthFactor >= 1.75) return "text-yellow-400";
        if (normalizedHealthFactor > 1) return "text-orange-400";
        return "text-red-400";
    };

    const getHealthBgColor = () => {
        if (normalizedHealthFactor >= 2.5) return "from-green-500/20 to-emerald-500/20";
        if (normalizedHealthFactor >= 1.75) return "from-yellow-500/20 to-amber-500/20";
        if (normalizedHealthFactor > 1) return "from-orange-500/20 to-red-500/20";
        return "from-red-500/20 to-pink-500/20";
    };

    return (
        <div className="rounded-xl p-6 bg-gray-800/50 border border-white/10 animate-slide-up">
            <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-white/60" />
                <h3 className="text-lg font-semibold text-white">Position Health</h3>
            </div>

            {/* Main Health Factor Display */}
            <div className={`mb-6 p-6 rounded-xl bg-gradient-to-br ${getHealthBgColor()} border border-white/10 text-center`}>
                <div className={`inline-flex p-3 rounded-full bg-black/20 mb-3 ${getHealthColor()}`}>
                    {getHealthIcon()}
                </div>
                <div className={`text-4xl font-bold mb-2 ${getHealthColor()}`}>
                    {debtAGSUSD === 0 ? "∞" : normalizedHealthFactor.toFixed(2)}
                </div>
                <div className="text-sm text-white/60 mb-2">Health Factor</div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${healthFactorRisk.color}`}>
                    {healthFactorRisk.label}
                </span>
            </div>

            {/* Health Factor Scale */}
            <div className="mb-6">
                <div className="h-3 rounded-full overflow-hidden flex">
                    <div className="flex-1 bg-red-500/60" />
                    <div className="flex-1 bg-orange-500/60" />
                    <div className="flex-1 bg-yellow-500/60" />
                    <div className="flex-1 bg-green-500/60" />
                </div>
                <div className="flex justify-between mt-1 text-xs text-white/50">
                    <span>Liquidation</span>
                    <span>1.0</span>
                    <span>1.75</span>
                    <span>2.5</span>
                    <span>Safe</span>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-white/60" />
                        <span className="text-sm text-white/80">Liquidation Price</span>
                    </div>
                    <span className={`text-sm font-semibold ${liquidationPrice > 0 && solPriceUSD > 0 && priceDropToLiquidation < 20 ? 'text-red-400' : 'text-white'}`}>
                        {liquidationPrice > 0 ? formatUSD(liquidationPrice) : debtAGSUSD === 0 ? "No Debt" : "N/A"}
                    </span>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-white/60" />
                        <span className="text-sm text-white/80">Current SOL Price</span>
                    </div>
                    <span className="text-sm font-semibold text-white">
                        {solPriceUSD > 0 ? formatUSD(solPriceUSD) : "Loading..."}
                    </span>
                </div>

                {liquidationPrice > 0 && solPriceUSD > 0 && (
                    <div className="flex items-center justify-between py-3 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-white/60" />
                            <span className="text-sm text-white/80">Price Drop Buffer</span>
                        </div>
                        <span className={`text-sm font-semibold ${priceDropToLiquidation < 20 ? 'text-red-400' : priceDropToLiquidation < 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {priceDropToLiquidation.toFixed(1)}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthFactor;
