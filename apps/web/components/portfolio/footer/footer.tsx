"use client";

import { Clock, Percent, Shield } from "lucide-react";
import { useMemo } from "react";
import type {
    BackendOracleData,
    BackendProtocolStateData,
} from "../../../types";
import { formatUSD, getSOLPriceUSD } from "../../../utils";

interface FooterProps {
    oracle: BackendOracleData | null;
    protocolState: BackendProtocolStateData | null;
}

const Footer = ({ oracle, protocolState }: FooterProps) => {
    // Calculate minimum collateral ratio percentage
    const minCollateralRatio = useMemo(() => {
        if (!protocolState) return 150;
        const collateralRatioBps = Number(protocolState.collateralRatioBps) || 15000;
        return collateralRatioBps / 100;
    }, [protocolState]);

    // Calculate liquidation threshold
    const liquidationThreshold = useMemo(() => {
        if (!protocolState) return 130;
        const liquidationRatioBps = Number(protocolState.liquidationThresholdBps) || 13000;
        return liquidationRatioBps / 100;
    }, [protocolState]);

    // Get SOL price in USD
    const solPriceUSD = useMemo(() => getSOLPriceUSD(oracle), [oracle]);

    // Last updated time
    const lastUpdated = useMemo(() => {
        const now = new Date();
        return now.toLocaleTimeString();
    }, []);

    return (
        <div className="mt-8">
            <div className="grid md:grid-cols-4 gap-4">
                <div className="rounded-xl p-5 bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <Percent className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-white/60">Min Collateral Ratio</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {minCollateralRatio.toFixed(0)}%
                    </div>
                </div>

                <div className="rounded-xl p-5 bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-white/60">Liquidation Threshold</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {liquidationThreshold.toFixed(0)}%
                    </div>
                </div>

                <div className="rounded-xl p-5 bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-white/60">SOL Price</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {solPriceUSD > 0 ? formatUSD(solPriceUSD) : "Loading..."}
                    </div>
                </div>

                <div className="rounded-xl p-5 bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-white/60">Last Updated</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{lastUpdated}</div>
                </div>
            </div>

            {/* Protocol Info */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5 border border-white/10">
                <p className="text-center text-sm text-white/50">
                    Portfolio data refreshes automatically. Collateral and debt values are calculated in real-time based on current oracle prices.
                </p>
            </div>
        </div>
    );
};

export default Footer;
