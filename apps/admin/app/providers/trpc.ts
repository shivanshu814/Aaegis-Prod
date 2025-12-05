import { createTRPCReact, type CreateTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@aegis/backend";

// Export trpc
export const trpc: CreateTRPCReact<AppRouter, unknown, null> =
  createTRPCReact<AppRouter>();
