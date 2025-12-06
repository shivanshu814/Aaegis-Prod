import { router } from "../trpc";
import { alertsRouter } from "./alerts";
import { analyticsRouter } from "./analytics";
import { feesRouter } from "./fees";
import { healthRouter } from "./health";
import { positionsRouter } from "./positions";
import { protocolRouter } from "./protocol";
import { syncRouter } from "./sync";
import { usersRouter } from "./users";
import { vaultsRouter } from "./vaults";

// Export router
export const appRouter = router({
  health: healthRouter,
  positions: positionsRouter,
  vaults: vaultsRouter,
  protocol: protocolRouter,
  alerts: alertsRouter,
  analytics: analyticsRouter,
  fees: feesRouter,
  sync: syncRouter,
  users: usersRouter,
});

// Export router type
export type AppRouter = typeof appRouter;
