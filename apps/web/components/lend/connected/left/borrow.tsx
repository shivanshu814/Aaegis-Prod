import type {
    BackendOracleData,
    BackendProtocolStateData,
    BackendVaultData,
} from "../../../../types";
import { useCallback, useMemo } from "react";
import {
    formatAGSUSD,
    formatUSD,
    getSelectedPercentage,
    getVaultDebtAGSUSD,
} from "../../../../utils";

interface BorrowProps {
    isSDKReady: boolean;
    vault: BackendVaultData | null;
    oracle: BackendOracleData | null;
    protocolState: BackendProtocolStateData | null;
    solAmount: string;
    agsAmount: string;
    setAgsAmount: (value: string) => void;
    availableToBorrow: number;
}

const Borrow = ({
    isSDKReady,
    vault,
    oracle,
    protocolState,
    solAmount,
    agsAmount,
    setAgsAmount,
    availableToBorrow,
}: BorrowProps) => {
    // Get current debt AGSUSD from vault
    const currentDebtAGSUSD = useMemo(() => getVaultDebtAGSUSD(vault), [vault]);

    // Handle percentage button clicks
    const handlePercentageClick = useCallback(
        (percentage: number) => {
            if (availableToBorrow <= 0) return;
            const amount = (availableToBorrow * percentage) / 100;
            setAgsAmount(amount.toFixed(2)); // Use 2 decimals for AGSUSD precision
        },
        [availableToBorrow, setAgsAmount]
    );

    // Handle Max button click
    const handleMaxClick = useCallback(() => {
        if (availableToBorrow <= 0) return;
        setAgsAmount(availableToBorrow.toFixed(2));
    }, [availableToBorrow, setAgsAmount]);

    // Determine which button is selected based on current amount
    const selectedPercentage = useMemo(
        () => getSelectedPercentage(agsAmount, availableToBorrow, 0, 0.01),
        [agsAmount, availableToBorrow]
    );

    return (
        <div className='rounded-xl p-6 bg-white/5 border border-white/10'>
            <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-semibold text-white'>Borrow</h2>
            </div>

            <div className='space-y-4'>
                {/* Asset Selector */}
                <div className='flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10'>
                    <div className='w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white/5'>
                        <img
                            src='https://avatars.githubusercontent.com/u/235737903?s=400&u=a850ac2de9d74b1f2712f875a2fed01172feef4a&v=4'
                            alt='AGSUSD'
                            className='w-full h-full object-cover'
                        />
                    </div>
                    <div className='flex-1'>
                        <div className='text-sm text-white/60'>Asset</div>
                        <div className='text-white font-semibold'>AGSUSD</div>
                    </div>
                    <div className='text-right'>
                        <div className='text-sm text-white/60'>Borrowed</div>
                        <div className='text-white font-semibold'>
                            {formatAGSUSD(currentDebtAGSUSD)}
                        </div>
                        <div className='text-xs text-white/60'>
                            {formatUSD(currentDebtAGSUSD)}
                        </div>
                    </div>
                </div>

                {/* Amount Input */}
                <div>
                    <div className='flex items-center justify-between mb-2'>
                        <label className='text-sm text-white/60'>Amount to Borrow</label>
                        {availableToBorrow > 0 && (
                            <span className='text-xs text-white/40'>
                                Available: {formatAGSUSD(availableToBorrow)}
                            </span>
                        )}
                    </div>
                    <input
                        type='number'
                        placeholder='0.00'
                        value={agsAmount}
                        onChange={(e) => setAgsAmount(e.target.value)}
                        className='w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50'
                        disabled={!isSDKReady}
                    />
                    {/* Quick Select Buttons */}
                    {availableToBorrow > 0 && (
                        <div className='flex items-center gap-2 mt-2'>
                            <button
                                type='button'
                                onClick={() => handlePercentageClick(25)}
                                disabled={!isSDKReady}
                                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selectedPercentage === 25
                                        ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 hover:text-cyan-300"
                                        : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                25%
                            </button>
                            <button
                                type='button'
                                onClick={() => handlePercentageClick(50)}
                                disabled={!isSDKReady}
                                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selectedPercentage === 50
                                        ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 hover:text-cyan-300"
                                        : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                50%
                            </button>
                            <button
                                type='button'
                                onClick={() => handlePercentageClick(75)}
                                disabled={!isSDKReady}
                                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selectedPercentage === 75
                                        ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 hover:text-cyan-300"
                                        : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                75%
                            </button>
                            <button
                                type='button'
                                onClick={handleMaxClick}
                                disabled={!isSDKReady}
                                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selectedPercentage === "max"
                                        ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 hover:text-cyan-300"
                                        : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                Max
                            </button>
                        </div>
                    )}
                    {!agsAmount && (
                        <div className='mt-2 text-xs text-red-400'>Value is required</div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Borrow;
