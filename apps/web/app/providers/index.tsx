"use client";

import { trpc } from "./trpc";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { AegisProvider } from "./aegis-sdk";
import { httpBatchLink } from "@trpc/client";
import { clusterApiUrl } from "@solana/web3.js";
import React, { useState, useMemo } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Export providers
export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/v1";
    const url = backendUrl.endsWith("/v1") ? backendUrl : `${backendUrl}/v1`;
    return trpc.createClient({
      links: [
        httpBatchLink({
          url,
        }),
      ],
    });
  });

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AegisProvider>
            <trpc.Provider client={trpcClient} queryClient={queryClient}>
              <QueryClientProvider client={queryClient}>
                {children}
              </QueryClientProvider>
            </trpc.Provider>
          </AegisProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
