import { z } from "zod";
import { publicProcedure } from "../../trpc";

// Export health mutation router
export const healthMutation = publicProcedure
  .input(z.object({ message: z.string() }))
  .mutation(({ input }) => {
    return {
      status: "ok",
      received: input.message,
      message: "Health mutation is working successfully!",
    };
  });
