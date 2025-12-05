"use client";

import {
    ArrowDownFromLine,
    ArrowUpFromLine,
    FileCheckCorner,
    Settings,
} from "lucide-react";
import { formatAGSUSD, formatSOL } from "../../../../utils";

interface ActionsPanelProps {
    showActions: boolean;
    setShowActions: (value: boolean) => void;
    permitCompleted: boolean;
    setPermitCompleted: (value: boolean) => void;
    depositCompleted: boolean;
    setDepositCompleted: (value: boolean) => void;
    borrowCompleted: boolean;
    setBorrowCompleted: (value: boolean) => void;
    solAmount: string;
    agsAmount: string;
    isLoading: boolean;
    handlePermit: () => void;
    handleDeposit: () => void;
    handleBorrowAction: () => void;
}

const ActionsPanel = ({
    showActions,
    setShowActions,
    permitCompleted,
    setPermitCompleted,
    depositCompleted,
    setDepositCompleted,
    borrowCompleted,
    setBorrowCompleted,
    solAmount,
    agsAmount,
    isLoading,
    handlePermit,
    handleDeposit,
    handleBorrowAction,
}: ActionsPanelProps) => {
    if (!showActions) return null;

    return (
        <div className='mt-6 rounded-xl p-6 bg-white/5 border border-white/10 animate-slide-up'>
            <div className='flex items-center justify-between mb-6'>
                <h3 className='text-xl font-semibold text-white'>Actions</h3>
                <button
                    onClick={() => {
                        setShowActions(false);
                        setPermitCompleted(false);
                        setDepositCompleted(false);
                        setBorrowCompleted(false);
                    }}
                    className='p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer'
                >
                    <Settings className='w-5 h-5 text-white/60' />
                </button>
            </div>

            <div className='space-y-4'>
                {/* Step 1: Permit SOL */}
                <div className='flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10'>
                    <div className='flex items-center gap-3 flex-1'>
                        <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center text-white font-bold text-lg'>
                            1
                        </div>
                        <div className='w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center'>
                            <FileCheckCorner className='w-5 h-5 text-purple-400' />
                        </div>
                        <div className='w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white/5 shadow-lg shadow-orange-500/20'>
                            <img
                                src='https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png'
                                alt='SOL'
                                className='w-full h-full object-cover'
                            />
                        </div>
                        <div className='flex-1'>
                            <div className='text-sm font-semibold text-white'>Permit SOL</div>
                        </div>
                        <div className='text-sm text-white/80'>
                            {formatSOL(parseFloat(solAmount) || 0)} SOL
                        </div>
                    </div>
                    <button
                        onClick={handlePermit}
                        disabled={permitCompleted || isLoading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${permitCompleted
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {permitCompleted ? "✓ Permitted" : "Permit"}
                    </button>
                </div>

                {/* Step 2: Deposit SOL */}
                <div className='flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10'>
                    <div className='flex items-center gap-3 flex-1'>
                        <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center text-white font-bold text-lg'>
                            2
                        </div>
                        <div className='w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center'>
                            <ArrowDownFromLine className='w-5 h-5 text-blue-400' />
                        </div>
                        <div className='w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white/5 shadow-lg shadow-orange-500/20'>
                            <img
                                src='https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png'
                                alt='SOL'
                                className='w-full h-full object-cover'
                            />
                        </div>
                        <div className='flex-1'>
                            <div className='text-sm font-semibold text-white'>
                                Deposit SOL
                            </div>
                        </div>
                        <div className='text-sm text-white/80'>
                            {formatSOL(parseFloat(solAmount) || 0)} SOL
                        </div>
                    </div>
                    <button
                        onClick={handleDeposit}
                        disabled={
                            !permitCompleted ||
                            depositCompleted ||
                            isLoading ||
                            !solAmount ||
                            parseFloat(solAmount) <= 0
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${depositCompleted
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {depositCompleted ? "✓ Deposited" : "Deposit"}
                    </button>
                </div>

                {/* Step 3: Borrow AGSUSD */}
                <div className='flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10'>
                    <div className='flex items-center gap-3 flex-1'>
                        <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 flex items-center justify-center text-white font-bold text-lg'>
                            3
                        </div>
                        <div className='w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center'>
                            <ArrowUpFromLine className='w-5 h-5 text-green-400' />
                        </div>
                        <div className='w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white/5 shadow-lg shadow-green-500/20'>
                            <img
                                src='https://avatars.githubusercontent.com/u/235737903?s=400&u=a850ac2de9d74b1f2712f875a2fed01172feef4a&v=4'
                                alt='AGSUSD'
                                className='w-full h-full object-cover'
                            />
                        </div>
                        <div className='flex-1'>
                            <div className='text-sm font-semibold text-white'>
                                Borrow AGSUSD
                            </div>
                        </div>
                        <div className='text-sm text-white/80'>
                            {formatAGSUSD(parseFloat(agsAmount) || 0)} AGSUSD
                        </div>
                    </div>
                    <button
                        onClick={handleBorrowAction}
                        disabled={
                            !depositCompleted ||
                            borrowCompleted ||
                            isLoading ||
                            !agsAmount ||
                            parseFloat(agsAmount) <= 0
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${borrowCompleted
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {borrowCompleted ? "✓ Borrowed" : "Borrow"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActionsPanel;
