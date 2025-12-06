import { z } from "zod";
import {
    fullSync,
    getListenerStatus,
    syncPositions,
    syncProtocolState,
    syncVaultTypes
} from "../indexer/listener";
import { publicProcedure, router } from "../trpc";

export const syncRouter = router({
    // Get listener status
    getStatus: publicProcedure.query(() => {
        return getListenerStatus();
    }),

    // Force full sync (all data)
    forceFullSync: publicProcedure.mutation(async () => {
        await fullSync();
        return { success: true, timestamp: Date.now() };
    }),

    // Force protocol state sync only
    syncProtocolState: publicProcedure.mutation(async () => {
        const success = await syncProtocolState();
        return { success, timestamp: Date.now() };
    }),

    // Force positions sync only
    syncPositions: publicProcedure.mutation(async () => {
        const success = await syncPositions();
        return { success, timestamp: Date.now() };
    }),

    // Force vault types sync only
    syncVaultTypes: publicProcedure.mutation(async () => {
        const success = await syncVaultTypes();
        return { success, timestamp: Date.now() };
    }),

    // Get last update times for cache freshness check
    getCacheAge: publicProcedure.query(() => {
        const status = getListenerStatus();
        const now = Date.now();

        return {
            protocolState: {
                lastUpdate: status.lastProtocolUpdate,
                ageMs: status.lastProtocolUpdate ? now - status.lastProtocolUpdate : null,
                isStale: status.lastProtocolUpdate ? (now - status.lastProtocolUpdate) > 60000 : true, // Stale if > 1min
            },
            positions: {
                lastUpdate: status.lastPositionsUpdate,
                ageMs: status.lastPositionsUpdate ? now - status.lastPositionsUpdate : null,
                isStale: status.lastPositionsUpdate ? (now - status.lastPositionsUpdate) > 120000 : true, // Stale if > 2min
            },
            vaultTypes: {
                lastUpdate: status.lastVaultTypesUpdate,
                ageMs: status.lastVaultTypesUpdate ? now - status.lastVaultTypesUpdate : null,
                isStale: status.lastVaultTypesUpdate ? (now - status.lastVaultTypesUpdate) > 180000 : true, // Stale if > 3min
            },
        };
    }),

    // Pre-transaction refresh - use before on-chain actions
    preTransactionRefresh: publicProcedure
        .input(z.object({
            refreshProtocol: z.boolean().optional().default(true),
            refreshPositions: z.boolean().optional().default(false),
        }))
        .mutation(async ({ input }) => {
            const results = {
                protocolState: false,
                positions: false,
            };

            if (input.refreshProtocol) {
                results.protocolState = await syncProtocolState();
            }

            if (input.refreshPositions) {
                results.positions = await syncPositions();
            }

            return {
                success: true,
                refreshed: results,
                timestamp: Date.now()
            };
        }),
});
