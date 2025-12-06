"use client";

import UserTrackingWrapper from "@/components/shared/UserTrackingWrapper";
import { trpc } from "@/providers/query/trpc";
import { AegisProvider } from "@/providers/wallet/aegis-sdk";
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
                <UserTrackingWrapper>
                  {children}
                </UserTrackingWrapper>
              </QueryClientProvider>
            </trpc.Provider>
          </AegisProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
