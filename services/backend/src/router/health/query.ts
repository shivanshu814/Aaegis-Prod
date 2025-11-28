import { publicProcedure } from "../../trpc";

// Export health query router
export const healthQuery = publicProcedure.query(() => {
  return {
    status: "ok",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
});
