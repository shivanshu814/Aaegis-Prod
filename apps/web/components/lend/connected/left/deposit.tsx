import type {
    BackendOracleData,
    BackendProtocolStateData,
    BackendVaultData,
} from "../../../../types";
import { Info, Plus } from "lucide-react";
import { useCallback, useMemo } from "react";
import {
    calculateCollateralValueUSD,
    calculateDepositUSDValue,
    calculateNewBorrowAfterDeposit,
    formatSOL,
    formatUSD,
    getSelectedPercentage,
    getVaultCollateralSOL,
    getVaultDebtAGSUSD,
} from "../../../../utils";

interface DepositProps {
    isSDKReady: boolean;
    vault: BackendVaultData | null;
    oracle: BackendOracleData | null;
    protocolState: BackendProtocolStateData | null;
    solAmount: string;
    setSolAmount: (value: string) => void;
    agsAmount: string;
    setAgsAmount: (value: string) => void;
    walletBalanceSOL: number;
}

const Deposit = ({
    isSDKReady,
    vault,
    oracle,
    protocolState,
    solAmount,
    setSolAmount,
    agsAmount,
    setAgsAmount,
    walletBalanceSOL,
}: DepositProps) => {
    // Get current collateral SOL from vault
    const currentCollateralSOL = useMemo(
        () => getVaultCollateralSOL(vault),
        [vault]
    );

    // Get current debt AGSUSD from vault
    const currentDebtAGSUSD = useMemo(() => getVaultDebtAGSUSD(vault), [vault]);

    // Get current collateral value in USD
    const currentCollateralValueUSD = useMemo(
        () => calculateCollateralValueUSD(currentCollateralSOL, oracle),
        [currentCollateralSOL, oracle]
    );

    // Get deposit value in USD
    const depositUSDValue = useMemo(
        () => calculateDepositUSDValue(parseFloat(solAmount) || 0, oracle),
        [solAmount, oracle]
    );

    // Handle SOL amount change
    const handleSolAmountChange = useCallback(
        (value: string) => {
            setSolAmount(value);
            if (!agsAmount || parseFloat(agsAmount) === 0) {
                const sol = parseFloat(value) || 0;
                const newBorrow = calculateNewBorrowAfterDeposit(
                    currentCollateralSOL,
                    sol,
                    currentDebtAGSUSD,
                    oracle,
                    protocolState
                );
                if (newBorrow > 0) {
                    setAgsAmount(newBorrow.toFixed(2));
                }
            }
        },
        [
            agsAmount,
            currentCollateralSOL,
            currentDebtAGSUSD,
            oracle,
            protocolState,
            setSolAmount,
            setAgsAmount,
        ]
    );

    // Handle percentage button clicks
    const handlePercentageClick = useCallback(
        (percentage: number) => {
            if (walletBalanceSOL <= 0) return;
            const amount = (walletBalanceSOL * percentage) / 100;
            handleSolAmountChange(amount.toFixed(9)); // Use 9 decimals for SOL precision
        },
        [walletBalanceSOL, handleSolAmountChange]
    );

    // Handle Max button click
    const handleMaxClick = useCallback(() => {
        if (walletBalanceSOL <= 0) return;
        // Leave a small amount for transaction fees (0.01 SOL)
        const maxAmount = Math.max(0, walletBalanceSOL - 0.01);
        handleSolAmountChange(maxAmount.toFixed(9));
    }, [walletBalanceSOL, handleSolAmountChange]);

    // Determine which button is selected based on current amount
    const selectedPercentage = useMemo(
        () => getSelectedPercentage(solAmount, walletBalanceSOL),
        [solAmount, walletBalanceSOL]
    );
    return (
        <div className='rounded-xl p-6 bg-white/5 border border-white/10'>
            <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                    <h2 className='text-xl font-semibold text-white'>Deposit</h2>
                    <div className='relative group'>
                        <Info className='w-4 h-4 text-white/60 cursor-help hover:text-white/80 transition-colors' />
                        <div className='absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64'>
                            <div className='bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl border border-white/10'>
                                <div className='font-semibold mb-1 text-white'>
                                    Deposit SOL Collateral
                                </div>
                                <div className='text-white/70 leading-relaxed'>
                                    Deposit SOL to use as collateral for borrowing AGSUSD
                                    stablecoins. Your collateral determines how much you can
                                    borrow.
                                </div>
                                <div className='absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'></div>
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
                    className='flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors'
                >
                    <Plus className='w-4 h-4' />
                    Add more
                </button>
            </div>

            <div className='space-y-4'>
                {/* Asset Selector */}
                <div className='flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10'>
                    <div className='w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white/5'>
                        <img
                            src='https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png'
                            alt='SOL'
                            className='w-full h-full object-cover'
                        />
                    </div>
                    <div className='flex-1'>
                        <div className='text-sm text-white/60'>Asset</div>
                        <div className='text-white font-semibold'>SOL</div>
                    </div>
                    <div className='text-right'>
                        <div className='text-sm text-white/60'>Deposited</div>
                        <div className='text-white font-semibold'>
                            {formatSOL(currentCollateralSOL)}
                        </div>
                        <div className='text-xs text-white/60'>
                            {formatUSD(currentCollateralValueUSD)}
                        </div>
                    </div>
                </div>

                {/* Deposit Amount Input */}
                <div>
                    <div className='flex items-center justify-between mb-2'>
                        <label className='text-sm text-white/60'>Amount to Deposit</label>
                        {walletBalanceSOL > 0 && (
                            <span className='text-xs text-white/40'>
                                Available: {formatSOL(walletBalanceSOL)}
                            </span>
                        )}
                    </div>
                    <input
                        type='number'
                        placeholder='0.00'
                        value={solAmount}
                        onChange={(e) => handleSolAmountChange(e.target.value)}
                        className='w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50'
                        disabled={!isSDKReady}
                    />
                    {/* Quick Select Buttons */}
                    {walletBalanceSOL > 0 && (
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
                    {/* Deposit USD Value */}
                    {solAmount && (
                        <div className='mt-2 text-sm text-white/60'>
                            USD Value: {formatUSD(depositUSDValue)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Deposit;
