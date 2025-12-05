import type {
    BackendOracleData,
    BackendProtocolStateData,
} from "../../../../types";
import { useCallback, useMemo } from "react";
import { calculateBorrowFromLTV, getLTVRiskZone } from "../../../../utils";

interface LoanValueProps {
    oracle: BackendOracleData | null;
    protocolState: BackendProtocolStateData | null;
    agsAmount: string;
    setAgsAmount: (value: string) => void;
    currentLTV: number;
    maxLTV: number;
    liquidationLTV: number;
    totalCollateralValueUSD: number;
    availableToBorrow: number;
    currentDebtAGSUSD: number;
}

const LoanValue = ({
    oracle,
    protocolState,
    agsAmount,
    setAgsAmount,
    currentLTV,
    maxLTV,
    liquidationLTV,
    totalCollateralValueUSD,
    availableToBorrow,
    currentDebtAGSUSD,
}: LoanValueProps) => {
    // Get risk zone
    const riskZone = useMemo(
        () => getLTVRiskZone(currentLTV, maxLTV),
        [currentLTV, maxLTV]
    );

    // Handle LTV slider change
    const handleLTVChange = useCallback(
        (value: number) => {
            const finalBorrow = calculateBorrowFromLTV(
                value,
                totalCollateralValueUSD,
                currentDebtAGSUSD,
                availableToBorrow
            );
            setAgsAmount(finalBorrow > 0 ? finalBorrow.toFixed(2) : "0");
        },
        [
            totalCollateralValueUSD,
            currentDebtAGSUSD,
            availableToBorrow,
            setAgsAmount,
        ]
    );
    return (
        <div className='rounded-xl p-6 bg-white/5 border border-white/10'>
            <div className='mb-4'>
                <h2 className='text-xl font-semibold text-white mb-1'>
                    Loan to Value (LTV)
                </h2>
                <p className='text-sm text-white/60'>
                    Ratio of the collateral value to the borrowed value
                </p>
            </div>

            <div className='space-y-4'>
                {/* Current LTV Display */}
                <div className='flex items-center justify-between'>
                    <div>
                        <div className='text-sm text-white/60'>Current LTV</div>
                        <div
                            className={`text-2xl font-bold ${currentLTV > 0
                                    ? riskZone.color.replace("bg-", "text-")
                                    : "text-green-400"
                                }`}
                        >
                            {currentLTV > 0 ? `${currentLTV.toFixed(2)}%` : "0.00%"}
                        </div>
                    </div>
                    <div>
                        <div className='text-sm text-white/60'>Max LTV</div>
                        <div className='text-lg font-semibold text-white'>
                            max. {maxLTV.toFixed(2)}%
                        </div>
                    </div>
                </div>

                {/* LTV Slider */}
                <div className='relative pt-4'>
                    {(() => {
                        // Slider should only go up to maxLTV (what user can actually borrow)
                        const sliderMax = Math.max(maxLTV, currentLTV);
                        // Liquidation threshold position relative to maxLTV
                        // If liquidationLTV > maxLTV, show it at the end (100%)
                        const liquidationPosition =
                            maxLTV > 0 ? Math.min(100, (liquidationLTV / maxLTV) * 100) : 0;
                        return (
                            <>
                                <input
                                    type='range'
                                    min='0'
                                    max={sliderMax}
                                    step='0.1'
                                    value={Math.min(currentLTV, maxLTV)}
                                    onChange={(e) => handleLTVChange(parseFloat(e.target.value))}
                                    className='w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider'
                                    style={{
                                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${((maxLTV * 0.5) / sliderMax) * 100}%, #f59e0b ${((maxLTV * 0.75) / sliderMax) * 100}%, #ef4444 ${((maxLTV * 0.95) / sliderMax) * 100}%, #ef4444 100%)`,
                                    }}
                                />
                                <div className='flex justify-between mt-2 text-xs text-white/60'>
                                    <span>Conservative</span>
                                    <span>Moderate</span>
                                    <span>Aggressive</span>
                                    <span>Liquidation</span>
                                </div>
                                {/* Liquidation threshold marker */}
                                {liquidationLTV > 0 && maxLTV > 0 && (
                                    <>
                                        <div
                                            className='absolute top-0 w-0.5 h-2 bg-red-500'
                                            style={{ left: `${liquidationPosition}%` }}
                                        />
                                        <div
                                            className='absolute -top-6 text-xs text-red-400 font-semibold'
                                            style={{
                                                left: `${liquidationPosition}%`,
                                                transform: "translateX(-50%)",
                                            }}
                                        >
                                            {liquidationLTV.toFixed(0)}%
                                        </div>
                                    </>
                                )}
                            </>
                        );
                    })()}
                </div>

                {/* Risk Indicator */}
                {currentLTV > 0 && (
                    <div className='flex items-center gap-2 p-3 rounded-lg bg-white/5'>
                        <div className={`w-3 h-3 rounded-full ${riskZone.color}`} />
                        <span className='text-sm text-white/80'>
                            {riskZone.label} Risk Zone
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
export default LoanValue;
