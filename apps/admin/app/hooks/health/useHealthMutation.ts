import { trpc } from "../../providers/trpc";

// Export health mutation hook
export const useHealthMutation = (onSuccess?: (data: unknown) => void) => {
  return trpc.health.checkHealthMutation.useMutation({
    onSuccess,
    retry: 3,
    retryDelay: 1000,
  });
};
