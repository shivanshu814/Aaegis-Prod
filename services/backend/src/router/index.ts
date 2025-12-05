import { router } from "../trpc";
import { alertsRouter } from "./alerts";
import { analyticsRouter } from "./analytics";
import { healthRouter } from "./health";
import { positionsRouter } from "./positions";
import { protocolRouter } from "./protocol";
import { vaultsRouter } from "./vaults";

// Export router
export const appRouter = router({
  health: healthRouter,
  positions: positionsRouter,
  vaults: vaultsRouter,
  protocol: protocolRouter,
  alerts: alertsRouter,
  analytics: analyticsRouter,
});

// Export router type
export type AppRouter = typeof appRouter;
