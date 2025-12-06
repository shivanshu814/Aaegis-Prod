"use client";

import { AlertTriangle, ArrowRight, DollarSign, RefreshCw, TrendingUp } from "lucide-react";
import { trpc } from "../../providers/trpc";

// Helper to format USD from 6 decimals
function formatUSD(amount: number): string {
    const usd = amount / 1_000_000;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(usd);
}

// Helper to truncate pubkey
function truncatePubkey(pubkey: string): string {
    if (!pubkey || pubkey.length < 8) return pubkey;
    return `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`;
}

// Helper to format date
function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Type for liquidation log items
interface LiquidationLogItem {
    positionOwner: string;
    debtRepaid: number;
    collateralSeized: number;
    penaltyFee: number;
    timestamp: number;
    txSignature: string;
}


export default function FeesPage() {
    // Fetch fee summary
    const { data: feeSummary, isLoading: summaryLoading, refetch: refetchSummary } = trpc.fees.getFeeSummary.useQuery();

    // Fetch recent liquidations
    const { data: liquidationsData, isLoading: liquidationsLoading, refetch: refetchLiquidations } = trpc.fees.getRecentLiquidations.useQuery({
        limit: 10,
        offset: 0,
    });

    // Calculate total fees from summary
    const totalFeesCollected = feeSummary?.totalFeesCollected || 0;
    const totalLiquidations = feeSummary?.liquidations?.count || 0;
    const protocolRevenue = feeSummary?.liquidations?.totalPenaltyFees || 0;

    const stats = [
        {
            title: "Total Fees Collected",
            value: summaryLoading ? "Loading..." : formatUSD(totalFeesCollected),
            change: `${feeSummary?.totalTransactions || 0} txns`,
            icon: DollarSign,
            color: "text-green-500",
            bg: "bg-green-500/20",
        },
        {
            title: "Protocol Revenue",
            value: summaryLoading ? "Loading..." : formatUSD(protocolRevenue),
            change: "from liquidations",
            icon: TrendingUp,
            color: "text-blue-500",
            bg: "bg-blue-500/20",
        },
        {
            title: "Total Liquidations",
            value: summaryLoading ? "Loading..." : totalLiquidations.toString(),
            change: `${formatUSD(feeSummary?.liquidations?.totalDebtRepaid || 0)} repaid`,
            icon: AlertTriangle,
            color: "text-red-500",
            bg: "bg-red-500/20",
        },
    ];

    const feeBreakdown = [
        {
            name: "Mint Fees",
            value: formatUSD(feeSummary?.feesByType?.mint?.amount || 0),
            count: feeSummary?.feesByType?.mint?.count || 0,
            percentage: totalFeesCollected > 0
                ? Math.round(((feeSummary?.feesByType?.mint?.amount || 0) / totalFeesCollected) * 100)
                : 0
        },
        {
            name: "Redeem Fees",
            value: formatUSD(feeSummary?.feesByType?.redeem?.amount || 0),
            count: feeSummary?.feesByType?.redeem?.count || 0,
            percentage: totalFeesCollected > 0
                ? Math.round(((feeSummary?.feesByType?.redeem?.amount || 0) / totalFeesCollected) * 100)
                : 0
        },
        {
            name: "Stability Fees",
            value: formatUSD(feeSummary?.feesByType?.stability?.amount || 0),
            count: feeSummary?.feesByType?.stability?.count || 0,
            percentage: totalFeesCollected > 0
                ? Math.round(((feeSummary?.feesByType?.stability?.amount || 0) / totalFeesCollected) * 100)
                : 0
        },
        {
            name: "Liquidation Penalties",
            value: formatUSD(feeSummary?.feesByType?.liquidation?.amount || 0),
            count: feeSummary?.feesByType?.liquidation?.count || 0,
            percentage: totalFeesCollected > 0
                ? Math.round(((feeSummary?.feesByType?.liquidation?.amount || 0) / totalFeesCollected) * 100)
                : 0
        },
    ];

    const handleRefresh = () => {
        refetchSummary();
        refetchLiquidations();
    };

    return (
        <div className="p-8 text-white max-w-7xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">
                        Fees & Revenue
                    </h1>
                    <p className="text-gray-400">
                        Track protocol fees, revenue, and liquidation events in real-time.
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-sm font-medium text-gray-400 bg-white/5 px-2 py-1 rounded-lg">
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
                        <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Fee Breakdown */}
                <div className="lg:col-span-1">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full">
                        <h2 className="text-xl font-bold text-white mb-6">Fee Breakdown</h2>
                        {summaryLoading ? (
                            <div className="flex items-center justify-center h-48">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {feeBreakdown.map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-400">{item.name}</span>
                                            <span className="text-white font-medium">{item.value}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-white/5 rounded-full h-2">
                                                <div
                                                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500 w-10 text-right">{item.percentage}%</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{item.count} transactions</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Liquidations Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Recent Liquidations</h2>
                            <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                                View All <ArrowRight size={16} />
                            </button>
                        </div>

                        {liquidationsLoading ? (
                            <div className="flex items-center justify-center h-48">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                            </div>
                        ) : liquidationsData?.logs && liquidationsData.logs.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10">
                                            <th className="pb-4 pl-4">Liquidated User</th>
                                            <th className="pb-4">Debt Repaid</th>
                                            <th className="pb-4">Collateral Seized</th>
                                            <th className="pb-4">Fee Collected</th>
                                            <th className="pb-4">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {(liquidationsData.logs as unknown as LiquidationLogItem[]).map((item, i) => (
                                            <tr key={i} className="group hover:bg-white/5 transition-colors">
                                                <td className="py-4 pl-4 font-mono text-sm text-blue-400 group-hover:text-blue-300">
                                                    {truncatePubkey(item.positionOwner)}
                                                </td>
                                                <td className="py-4 text-sm text-white font-medium">
                                                    {formatUSD(item.debtRepaid)}
                                                </td>
                                                <td className="py-4 text-sm text-gray-300">
                                                    {(item.collateralSeized / 1_000_000_000).toFixed(4)} SOL
                                                </td>
                                                <td className="py-4 text-sm text-green-400 font-medium">
                                                    {formatUSD(item.penaltyFee)}
                                                </td>
                                                <td className="py-4 text-sm text-gray-400">
                                                    {formatDate(item.timestamp)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                <AlertTriangle size={48} className="mb-4 opacity-50" />
                                <p className="text-lg font-medium">No Liquidations Yet</p>
                                <p className="text-sm mt-1">Liquidation events will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
