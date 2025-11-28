"use client";

import { useState } from "react";
import { useHealthQuery } from "./hooks/health/useHealthQuery";
import { useHealthMutation } from "./hooks/health/useHealthMutation";

export default function Home() {
  const [mutationResult, setMutationResult] = useState<string | null>(null);

  // tRPC Query
  const hello = useHealthQuery();

  // tRPC Mutation
  const mutation = useHealthMutation((data: unknown) => {
    setMutationResult(JSON.stringify(data, null, 2));
  });

  // Handle mutation
  const handleMutation = () => {
    mutation.mutate({ message: "Hello from Frontend!" });
  };

  return (
    <div className='min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900'>
      {/* Animated Background Gradients */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob'></div>
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000'></div>
      </div>

      {/* Main Content */}
      <div className='relative z-10 min-h-screen flex flex-col items-center justify-center gap-8 p-8'>
        <main className='flex flex-col gap-8 items-center w-full max-w-4xl'>
          {/* Header */}
          <div className='text-center space-y-4 mb-8'>
            <h1 className='text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient'>
              tRPC Testing Suite
            </h1>
            <p className='text-gray-400 text-lg'>
              Real-time API testing with modern design
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-6 w-full'>
            {/* Query Section */}
            <div className='group relative'>
              {/* Glow Effect */}
              <div className='absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500'></div>

              <div className='relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02]'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50'>
                    <svg
                      className='w-6 h-6 text-white'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10'
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className='text-2xl font-bold text-white'>Query</h2>
                    <p className='text-sm text-gray-400'>GET Request</p>
                  </div>
                </div>

                {/* Response Display */}
                <div className='bg-black/40 backdrop-blur-sm border border-white/5 rounded-xl p-4 mb-6 min-h-[180px] overflow-auto'>
                  {hello.isLoading ? (
                    <div className='flex items-center justify-center h-full'>
                      <div className='relative'>
                        <div className='w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin'></div>
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <div className='w-8 h-8 rounded-full bg-cyan-500/20 animate-pulse'></div>
                        </div>
                      </div>
                    </div>
                  ) : hello.error ? (
                    <div className='flex items-start gap-3'>
                      <div className='w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5'>
                        <svg
                          className='w-4 h-4 text-red-400'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M6 18L18 6M6 6l12 12'
                          />
                        </svg>
                      </div>
                      <div>
                        <p className='text-red-400 font-semibold'>Error</p>
                        <p className='text-red-300/80 text-sm mt-1'>
                          {hello.error.message}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <pre className='text-sm text-cyan-300 font-mono leading-relaxed'>
                      {JSON.stringify(hello.data, null, 2)}
                    </pre>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => hello.refetch()}
                  className='w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2'
                >
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                    />
                  </svg>
                  Refetch Query
                </button>
              </div>
            </div>

            {/* Mutation Section */}
            <div className='group relative'>
              {/* Glow Effect */}
              <div className='absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500'></div>

              <div className='relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50'>
                    <svg
                      className='w-6 h-6 text-white'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className='text-2xl font-bold text-white'>Mutation</h2>
                    <p className='text-sm text-gray-400'>POST Request</p>
                  </div>
                </div>

                {/* Response Display */}
                <div className='bg-black/40 backdrop-blur-sm border border-white/5 rounded-xl p-4 mb-6 min-h-[180px] overflow-auto'>
                  {mutation.isPending ? (
                    <div className='flex items-center justify-center h-full'>
                      <div className='relative'>
                        <div className='w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin'></div>
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <div className='w-8 h-8 rounded-full bg-purple-500/20 animate-pulse'></div>
                        </div>
                      </div>
                    </div>
                  ) : mutationResult ? (
                    <pre className='text-sm text-purple-300 font-mono leading-relaxed'>
                      {mutationResult}
                    </pre>
                  ) : (
                    <div className='flex items-center justify-center h-full'>
                      <div className='text-center'>
                        <div className='w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center'>
                          <svg
                            className='w-8 h-8 text-gray-500'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
                            />
                          </svg>
                        </div>
                        <p className='text-gray-500 text-sm'>
                          No mutation result yet
                        </p>
                        <p className='text-gray-600 text-xs mt-1'>
                          Click below to run
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={handleMutation}
                  disabled={mutation.isPending}
                  className='w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2'
                >
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                  Run Mutation
                </button>
              </div>
            </div>
          </div>

          {/* Status Footer */}
          <div className='mt-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 w-full'>
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></div>
                <span className='text-gray-400'>API Connected</span>
              </div>
              <div className='text-gray-500'>tRPC v10 • TanStack Query</div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
