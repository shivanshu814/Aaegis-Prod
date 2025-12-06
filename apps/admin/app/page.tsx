"use client";

import {
  Activity,
  AlertTriangle,
  BadgeDollarSign,
  Bell,
  Coins,
  Landmark,
  RefreshCw,
  Rocket,
  Settings2,
  TrendingUp,
  Users,
  Wallet
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { trpc } from "./providers/trpc";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

// Helper to format USD
function formatUSD(amount: number): string {
  const usd = amount / 1_000_000;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(usd);
}

export default function Home() {
  // Fetch live analytics
  const { data: liveStats, isLoading: statsLoading, refetch } = trpc.analytics.getLiveStats.useQuery();
  const { data: alertStats } = trpc.alerts.getStats.useQuery();

  // Safely extract stats - handle both old and new API response formats
  const positionCount = (liveStats as Record<string, unknown>)?.activePositionCount ?? (liveStats as Record<string, unknown>)?.positionCount ?? 0;
  const totalDebt = (liveStats as Record<string, unknown>)?.totalDebt ?? 0;
  const totalFees = (liveStats as Record<string, unknown>)?.totalFees ?? 0;
  const riskyCount = (liveStats as Record<string, unknown>)?.riskyCount ?? 0;
  const debtUtilization = (liveStats as Record<string, unknown>)?.debtUtilization ?? 0;

  const stats = [
    {
      title: "Total Positions",
      value: statsLoading ? "..." : String(positionCount),
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/20",
    },
    {
      title: "Total Debt",
      value: statsLoading ? "..." : formatUSD(Number(totalDebt)),
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/20",
    },
    {
      title: "Total Fees",
      value: statsLoading ? "..." : formatUSD(Number(totalFees)),
      icon: BadgeDollarSign,
      color: "text-purple-400",
      bg: "bg-purple-500/20",
    },
    {
      title: "Risky Positions",
      value: statsLoading ? "..." : String(riskyCount),
      icon: AlertTriangle,
      color: riskyCount ? "text-red-400" : "text-gray-400",
      bg: riskyCount ? "bg-red-500/20" : "bg-gray-500/20",
    },
  ];

  return (
    <div className='min-h-screen relative overflow-hidden'>
      {/* Main Content */}
      <div className='relative z-10 min-h-screen p-8'>
        {/* Header */}
        <div className='max-w-7xl mx-auto mb-8'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-5xl font-bold gradient-text mb-2'>
                Aegis Protocol Admin
              </h1>
              <p className='text-gray-400 text-lg'>
                Real-time protocol management dashboard
              </p>
            </div>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => refetch()}
                className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
              >
                <RefreshCw size={20} className="text-gray-400" />
              </button>
              <div className='scale-90'>
                <WalletMultiButton />
              </div>
            </div>
          </div>
        </div>

        {/* Live Stats */}
        <div className='max-w-7xl mx-auto mb-8'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {stats.map((stat, i) => (
              <div key={i} className='bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl'>
                <div className='flex items-center gap-3 mb-3'>
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                </div>
                <p className='text-gray-400 text-sm'>{stat.title}</p>
                <p className='text-2xl font-bold text-white mt-1'>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Health Score & Alerts */}
        <div className='max-w-7xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Protocol Stats */}
          <div className='bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl'>
            <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
              <Activity className="text-purple-400" size={20} />
              Protocol Overview
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-white/5 rounded-lg p-3'>
                <p className='text-xs text-gray-500'>Debt Utilization</p>
                <p className='text-xl font-bold text-white'>{String(debtUtilization)}%</p>
              </div>
              <div className='bg-white/5 rounded-lg p-3'>
                <p className='text-xs text-gray-500'>Active Vaults</p>
                <p className='text-xl font-bold text-white'>{String((liveStats as Record<string, unknown>)?.vaultCount ?? 0)}</p>
              </div>
              <div className='bg-white/5 rounded-lg p-3'>
                <p className='text-xs text-gray-500'>Total Collateral</p>
                <p className='text-xl font-bold text-white'>{formatUSD(Number((liveStats as Record<string, unknown>)?.tvl ?? 0))}</p>
              </div>
              <div className='bg-white/5 rounded-lg p-3'>
                <p className='text-xs text-gray-500'>Protocol Debt</p>
                <p className='text-xl font-bold text-white'>{formatUSD(Number((liveStats as Record<string, unknown>)?.totalProtocolDebt ?? 0))}</p>
              </div>
            </div>
          </div>

          {/* Alerts Summary */}
          <div className='bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl'>
            <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
              <Bell className="text-amber-400" size={20} />
              Alerts Overview
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-red-500/10 border border-red-500/30 rounded-xl p-3'>
                <p className='text-2xl font-bold text-red-400'>{alertStats?.bySeverity?.CRITICAL || 0}</p>
                <p className='text-xs text-gray-400'>Critical</p>
              </div>
              <div className='bg-amber-500/10 border border-amber-500/30 rounded-xl p-3'>
                <p className='text-2xl font-bold text-amber-400'>{alertStats?.bySeverity?.WARNING || 0}</p>
                <p className='text-xs text-gray-400'>Warnings</p>
              </div>
              <div className='bg-blue-500/10 border border-blue-500/30 rounded-xl p-3'>
                <p className='text-2xl font-bold text-blue-400'>{alertStats?.bySeverity?.INFO || 0}</p>
                <p className='text-xs text-gray-400'>Info</p>
              </div>
              <div className='bg-purple-500/10 border border-purple-500/30 rounded-xl p-3'>
                <p className='text-2xl font-bold text-purple-400'>{alertStats?.unread || 0}</p>
                <p className='text-xs text-gray-400'>Unread</p>
              </div>
            </div>
            <Link href="/admin/alerts" className='mt-4 block text-center text-sm text-purple-400 hover:text-purple-300'>
              View All Alerts →
            </Link>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>

          {/* Initialize */}
          <Link href="/admin/initialize" className="group">
            <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-xl shadow-xl group-hover:shadow-purple-500/20 group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
                <Rocket size={24} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Initialize Protocol</h2>
              <p className="text-gray-400 text-sm">
                Set up the protocol for the first time.
              </p>
            </div>
          </Link>

          {/* Manage Vaults */}
          <Link href="/admin/vaults" className="group">
            <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-xl shadow-xl group-hover:shadow-cyan-500/20 group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform">
                <Landmark size={24} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Manage Vaults</h2>
              <p className="text-gray-400 text-sm">
                Create and manage collateral vault types.
              </p>
            </div>
          </Link>

          {/* Global Controls */}
          <Link href="/admin/protocol" className="group">
            <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/50 transition-all duration-300 backdrop-blur-xl shadow-xl group-hover:shadow-red-500/20 group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4 text-red-400 group-hover:scale-110 transition-transform">
                <Settings2 size={24} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Global Controls</h2>
              <p className="text-gray-400 text-sm">
                Emergency pause, shutdown, and flags.
              </p>
            </div>
          </Link>

          {/* Oracles */}
          <Link href="/admin/oracles" className="group">
            <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-yellow-500/50 transition-all duration-300 backdrop-blur-xl shadow-xl group-hover:shadow-yellow-500/20 group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-4 text-yellow-400 group-hover:scale-110 transition-transform">
                <Activity size={24} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Oracle Management</h2>
              <p className="text-gray-400 text-sm">
                Manage oracle sources and TTLs.
              </p>
            </div>
          </Link>

          {/* My Positions */}
          <Link href="/admin/positions" className="group">
            <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-green-500/50 transition-all duration-300 backdrop-blur-xl shadow-xl group-hover:shadow-green-500/20 group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4 text-green-400 group-hover:scale-110 transition-transform">
                <Wallet size={24} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">My Positions</h2>
              <p className="text-gray-400 text-sm">
                Open positions and manage debt.
              </p>
            </div>
          </Link>

          {/* Token Management */}
          <Link href="/admin/tokens" className="group">
            <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-pink-500/50 transition-all duration-300 backdrop-blur-xl shadow-xl group-hover:shadow-pink-500/20 group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4 text-pink-400 group-hover:scale-110 transition-transform">
                <Coins size={24} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Token Management</h2>
              <p className="text-gray-400 text-sm">
                Create AGSUSD and AGS tokens.
              </p>
            </div>
          </Link>

          {/* Fees & Revenue */}
          <Link href="/admin/fees" className="group">
            <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 transition-all duration-300 backdrop-blur-xl shadow-xl group-hover:shadow-emerald-500/20 group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 transition-transform">
                <BadgeDollarSign size={24} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Fees & Revenue</h2>
              <p className="text-gray-400 text-sm">
                Track protocol fees and revenue.
              </p>
            </div>
          </Link>

          {/* Alerts */}
          <Link href="/admin/alerts" className="group">
            <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/50 transition-all duration-300 backdrop-blur-xl shadow-xl group-hover:shadow-amber-500/20 group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4 text-amber-400 group-hover:scale-110 transition-transform">
                <Bell size={24} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Alerts & Notifications</h2>
              <p className="text-gray-400 text-sm">
                View alerts and send test emails.
              </p>
              {alertStats?.unread ? (
                <span className="inline-flex mt-2 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {alertStats.unread} unread
                </span>
              ) : null}
            </div>
          </Link>

        </div>

        {/* Status Footer */}
        <div className='max-w-7xl mx-auto mt-8'>
          <div className='backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4'>
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></div>
                  <span className='text-gray-400'>Connected</span>
                </div>
                <span className='text-gray-500'>|</span>
                <span className='text-gray-400'>
                  Debt Utilization: {String(debtUtilization)}%
                </span>
              </div>
              <div className='text-gray-500'>Powered by @aegis/sdk • v2.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

