"use client";

import { ArrowDownRight, ArrowUpRight, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";

const QuickActions = () => {
    return (
        <div className="rounded-xl p-6 bg-gray-800/50 border border-white/10 animate-slide-up">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>

            <div className="space-y-3">
                {/* Deposit & Borrow */}
                <Link
                    href="/lend"
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-white">Deposit & Borrow</div>
                            <div className="text-xs text-white/60">Add collateral or borrow more</div>
                        </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                </Link>

                {/* Repay & Withdraw */}
                <Link
                    href="/redeem"
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all group cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                            <ArrowDownRight className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-white">Repay & Withdraw</div>
                            <div className="text-xs text-white/60">Repay debt or withdraw collateral</div>
                        </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                </Link>

                {/* View Vaults */}
                <Link
                    href="/vaults"
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all group cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                            <RefreshCw className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-white">Explore Vaults</div>
                            <div className="text-xs text-white/60">View all protocol vaults</div>
                        </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                </Link>
            </div>
        </div>
    );
};

export default QuickActions;
