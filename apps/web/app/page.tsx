/** @format */

'use client';

import Dashboard from '@/modules/dashboard/components/Dashboard';

export default function HomePage() {
	return (
		<div className='min-h-screen px-4 py-12 sm:px-6 lg:px-8'>
			<div className='mx-auto space-y-12 max-w-7xl'>
				{/* Header Section */}
				<div className='mb-12 text-center'>
					<div className='inline-flex items-center gap-2 px-4 py-2 mb-8 border rounded-full bg-white/5 border-white/10 backdrop-blur-sm'>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src='/logo-mark-protocol.svg'
							alt='Aaegis'
							className='w-5 h-5 rounded-md'
						/>
						<span className='text-sm font-medium tracking-wide text-white/80'>
							Solana's Adaptive CDP Protocol
						</span>
					</div>

					<h1 className='mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl'>
						Aaegis <span className='gradient-text'>Finance</span>
					</h1>
					<p className='max-w-2xl mx-auto mb-12 text-xl leading-relaxed text-white/60'>
						The next generation of decentralized stablecoins on Solana. Mint
						AGSUSD with confidence using our adaptive liquidation engine.
					</p>
				</div>

				{/* Dashboard Component */}
				<Dashboard />
			</div>
		</div>
	);
}
