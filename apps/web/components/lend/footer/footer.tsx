"use client";

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
        const collateralRatioBps =
            Number(protocolState.collateralRatioBps) || 15000;
        return collateralRatioBps / 100;
    }, [protocolState]);

    // Calculate borrow fee percentage
    const borrowFeePercent = useMemo(() => {
        if (!protocolState) return 0.5;
        const mintFeeBps = Number(protocolState.mintFeeBps) || 50;
        return mintFeeBps / 100;
    }, [protocolState]);

    // Get SOL price in USD
    const solPriceUSD = useMemo(() => getSOLPriceUSD(oracle), [oracle]);

    return (
        <div className='grid md:grid-cols-3 gap-6 mt-8'>
            <div className='rounded-xl p-6 bg-white/[0.02] border border-white/10'>
                <div className='text-sm text-white/60 mb-2'>
                    Minimum Collateral Ratio
                </div>
                <div className='text-2xl font-bold text-white'>
                    {minCollateralRatio.toFixed(2)}%
                </div>
            </div>

            <div className='rounded-xl p-6 bg-white/[0.02] border border-white/10'>
                <div className='text-sm text-white/60 mb-2'>Borrow Fee</div>
                <div className='text-2xl font-bold text-white'>
                    {borrowFeePercent.toFixed(2)}%
                </div>
            </div>

            <div className='rounded-xl p-6 bg-white/[0.02] border border-white/10'>
                <div className='text-sm text-white/60 mb-2'>SOL Price</div>
                <div className='text-2xl font-bold text-white'>
                    {solPriceUSD > 0 ? formatUSD(solPriceUSD) : "Loading..."}
                </div>
            </div>
        </div>
    );
};

export default Footer;
