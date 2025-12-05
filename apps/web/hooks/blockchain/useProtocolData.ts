import { ProtocolStats, VaultTypeData } from "@/types/dashboard";
import { AegisClient } from "@aegis/sdk";
import { AnchorProvider } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function useProtocolData() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();

    const [stats, setStats] = useState<ProtocolStats | null>(null);
    const [vaults, setVaults] = useState<VaultTypeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Initialize client (read-only if no wallet)
    const client = useMemo(() => {
        const provider = new AnchorProvider(
            connection,
            wallet || {
                publicKey: PublicKey.default,
                signTransaction: async () => { throw new Error("Read-only"); },
                signAllTransactions: async () => { throw new Error("Read-only"); },
            } as any,
            { preflightCommitment: "confirmed" }
        );
        return new AegisClient(provider);
    }, [connection, wallet]);

    const fetchData = useCallback(async () => {
        try {
            setIsRefreshing(true);

            // 1. Fetch Protocol State
            const state = await client.fetchProtocolState();

            // Convert BN to numbers (assuming 6 decimals for USD values)
            const tvl = state.totalProtocolCollateralValue.toNumber() / 1_000_000;
            const totalDebt = state.totalProtocolDebt.toNumber() / 1_000_000;
            const debtCeiling = state.globalDebtCeiling.toNumber() / 1_000_000;

            setStats({
                tvl,
                totalDebt,
                debtCeiling,
                isPaused: state.isProtocolPaused,
            });

            // 2. Fetch Vault Types
            const vaultTypes = await client.fetchAllVaultTypes();

            const vaultsData = await Promise.all(
                vaultTypes.map(async (vt: any) => {
                    const account = vt.account;

                    // Fetch current price for this vault
                    let price = null;
                    try {
                        price = await client.getOraclePrice(account.oraclePriceAccount);
                    } catch (e) {
                        console.error("Failed to fetch on-chain price", e);
                    }

                    // Fallback price fetching for SOL if on-chain fails (common in devnet/local)
                    if (price === null && account.collateralMint.toString() === "So11111111111111111111111111111111111111112") {
                        try {
                            const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
                            const data = await response.json();
                            if (data.solana?.usd) {
                                price = data.solana.usd;
                            }
                        } catch (e) {
                            console.error("Fallback price fetch failed", e);
                        }
                    }

                    return {
                        publicKey: vt.publicKey,
                        collateralMint: account.collateralMint,
                        ltv: account.ltvBps.toNumber() / 100, // bps to %
                        stabilityFee: account.stabilityFeeBps / 100, // bps to %
                        minCollateralRatio: 10000 / account.ltvBps.toNumber(), // approx
                        debtCeiling: account.vaultDebtCeiling.toNumber() / 1_000_000,
                        isActive: account.isActive,
                        price,
                    };
                })
            );

            setVaults(vaultsData);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch protocol data");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [client]);

    useEffect(() => {
        fetchData();

        // Poll every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    return { stats, vaults, loading, isRefreshing, refresh: fetchData };
}
