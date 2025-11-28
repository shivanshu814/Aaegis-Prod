import { router } from "../trpc";
import { healthRouter } from "./health";

// Export router
export const appRouter = router({
  health: healthRouter,
});

// Export router type
export type AppRouter = typeof appRouter;
