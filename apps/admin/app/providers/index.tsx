"use client";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { clusterApiUrl } from "@solana/web3.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import React, { useMemo, useState } from "react";
import { AegisProvider } from "./aegis-sdk";
import { trpc } from "./trpc";

import { Toaster } from "sonner";

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
                <Toaster position="bottom-right" theme="dark" richColors />
              </QueryClientProvider>
            </trpc.Provider>
          </AegisProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
