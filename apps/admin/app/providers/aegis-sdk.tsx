"use client";

import { AegisClient } from "@aegis/sdk";
import { AnchorProvider } from "@coral-xyz/anchor";
import { createContext, useContext, useMemo, ReactNode } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AegisContextType } from "@aaegis/types";

const AegisContext = createContext<AegisContextType>({ client: null });

export function AegisProvider({ children }: { children: ReactNode }) {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const client = useMemo(() => {
    if (!wallet) return null;

    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: "confirmed",
    });

    return new AegisClient(provider);
  }, [connection, wallet]);

  return (
    <AegisContext.Provider value={{ client }}>{children}</AegisContext.Provider>
  );
}

export function useAegis() {
  return useContext(AegisContext);
}
