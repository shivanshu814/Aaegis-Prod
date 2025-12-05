import { Loader2, RefreshCw } from "lucide-react";

import { TOKEN_METADATA } from "@/lib/constants/tokens";
import { VaultTypeData } from "../../../types/dashboard";

interface VaultsTableProps {
    vaults: VaultTypeData[];
    isRefreshing: boolean;
    onRefresh: () => void;
}

export function VaultsTable({ vaults, isRefreshing, onRefresh }: VaultsTableProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatPercent = (value: number) => {
        return `${value.toFixed(2)}%`;
    };

    return (
        <div className="glass rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-xl font-semibold text-white">Supported Assets</h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <span className="text-sm text-gray-400">{vaults.length} Active Vaults</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Asset</th>
                            <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Price</th>
                            <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Max LTV</th>
                            <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Stability Fee</th>
                            <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                            <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {vaults.map((vault) => {
                            const metadata = TOKEN_METADATA[vault.collateralMint.toString()] || {
                                name: "Unknown Asset",
                                symbol: "UNKNOWN",
                                logoURI: ""
                            };

                            return (
                                <tr key={vault.publicKey.toString()} className="group hover:bg-white/[0.04] transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-xs font-bold text-white border border-white/10 overflow-hidden relative shadow-lg">
                                                {metadata.logoURI ? (
                                                    <img
                                                        src={metadata.logoURI}
                                                        alt={metadata.symbol}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span>{metadata.symbol.slice(0, 2)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white flex items-center gap-2">
                                                    {metadata.name}
                                                    <span className="text-xs text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                                        {metadata.symbol}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">
                                                    {vault.collateralMint.toString().slice(0, 4)}...{vault.collateralMint.toString().slice(-4)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right text-white font-mono">
                                        {vault.price ? formatCurrency(vault.price) : <span className="text-gray-600">N/A</span>}
                                    </td>
                                    <td className="py-4 px-6 text-right text-emerald-400 font-medium">
                                        {formatPercent(vault.ltv)}
                                    </td>
                                    <td className="py-4 px-6 text-right text-gray-300">
                                        {formatPercent(vault.stabilityFee)}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vault.isActive
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                                            }`}>
                                            {vault.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button className="btn-gradient px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300">
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}

                        {vaults.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-6 h-6 animate-spin opacity-50" />
                                        <p>Loading vaults...</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
