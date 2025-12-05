"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export default function Home() {
  return (
    <div className='min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900'>
      {/* Animated Background Gradients */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob'></div>
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000'></div>
      </div>

      {/* Main Content */}
      <div className='relative z-10 min-h-screen p-8'>
        {/* Header */}
        <div className='max-w-7xl mx-auto mb-12'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient mb-2'>
                Aegis Protocol Admin
              </h1>
              <p className='text-gray-400 text-lg'>
                Real-time protocol management dashboard
              </p>
            </div>
            <div className='scale-90'>
              <WalletMultiButton />
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          
          {/* Initialize */}
          <Link href="/admin/initialize" className="group">
            <div className="h-full p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-xl shadow-xl group-hover:shadow-purple-500/20 group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                🚀
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Initialize Protocol</h2>
              <p className="text-gray-400">
                Set up the protocol for the first time. Configure authorities and treasury.
              </p>
            </div>
          </Link>

          {/* Manage Vaults */}
          <Link href="/admin/vaults" className="group">
            <div className="h-full p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-xl shadow-xl group-hover:shadow-cyan-500/20 group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                🏦
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Manage Vaults</h2>
              <p className="text-gray-400">
                Create and manage collateral vault types. Configure risk parameters and limits.
              </p>
            </div>
          </Link>

          {/* Global Controls */}
          <Link href="/admin/protocol" className="group">
            <div className="h-full p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/50 transition-all duration-300 backdrop-blur-xl shadow-xl group-hover:shadow-red-500/20 group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                🎛️
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Global Controls</h2>
              <p className="text-gray-400">
                Emergency pause, shutdown, and global feature flags.
              </p>
            </div>
          </Link>

          {/* Oracles */}
          <Link href="/admin/oracles" className="group">
            <div className="h-full p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-yellow-500/50 transition-all duration-300 backdrop-blur-xl shadow-xl group-hover:shadow-yellow-500/20 group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                🔮
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Oracle Management</h2>
              <p className="text-gray-400">
                Manage oracle sources, TTLs, and update authorities.
              </p>
            </div>
          </Link>

          {/* My Positions */}
          <Link href="/admin/positions" className="group">
            <div className="h-full p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-green-500/50 transition-all duration-300 backdrop-blur-xl shadow-xl group-hover:shadow-green-500/20 group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                💰
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">My Positions</h2>
              <p className="text-gray-400">
                Open positions, deposit collateral, mint stablecoins, and manage your debt.
              </p>
            </div>
          </Link>

          {/* Token Management */}
          <Link href="/admin/tokens" className="group">
            <div className="h-full p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-pink-500/50 transition-all duration-300 backdrop-blur-xl shadow-xl group-hover:shadow-pink-500/20 group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                💵
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Token Management</h2>
              <p className="text-gray-400">
                Create AGSUSD stablecoin and AGS governance token with metadata.
              </p>
            </div>
          </Link>

        </div>

        {/* Status Footer */}
        <div className='max-w-7xl mx-auto mt-12'>
          <div className='backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4'>
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></div>
                <span className='text-gray-400'>Connected to Localnet</span>
              </div>
              <div className='text-gray-500'>Powered by @aegis/sdk • Anchor v0.31</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
