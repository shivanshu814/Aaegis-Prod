import { trpc } from "../../providers/trpc";

// Export health query hook
export const useHealthQuery = () => {
  return trpc.health.checkHealthQuery.useQuery(undefined, {
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });
};
