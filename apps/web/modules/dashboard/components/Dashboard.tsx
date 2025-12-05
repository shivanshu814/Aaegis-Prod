"use client";

import { useProtocolData } from "@/hooks/blockchain/useProtocolData";
import { Activity, Coins, Loader2, Shield } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { VaultsTable } from "./VaultsTable";

export default function Dashboard() {
    const { stats, vaults, loading, isRefreshing, refresh } = useProtocolData();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Value Locked"
                    value={stats ? formatCurrency(stats.tvl) : "$0.00"}
                    subtitle="Secured across all vaults"
                    icon={Shield}
                    iconColorClass="text-cyan-400"
                    borderColorClass="border-cyan-500/30"
                />
                <StatsCard
                    title="Total Stablecoins"
                    value={stats ? formatCurrency(stats.totalDebt) : "$0.00"}
                    subtitle="AGSUSD currently in circulation"
                    icon={Coins}
                    iconColorClass="text-purple-400"
                    borderColorClass="border-purple-500/30"
                />
                <StatsCard
                    title="Protocol Health"
                    value={stats?.isPaused ? "Paused" : "Active"}
                    subtitle="System status"
                    icon={Activity}
                    iconColorClass="text-emerald-400"
                    borderColorClass="border-emerald-500/30"
                />
            </div>

            {/* Vaults List */}
            <VaultsTable
                vaults={vaults}
                isRefreshing={isRefreshing}
                onRefresh={refresh}
            />
        </div>
    );
}
