import { router } from "../../trpc";
import { healthMutation } from "./mutation";
import { healthQuery } from "./query";

// Export router
export const healthRouter = router({
  checkHealthQuery: healthQuery,
  checkHealthMutation: healthMutation,
});
