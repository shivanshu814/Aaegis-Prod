import { VaultType } from "../models/VaultType";
import { publicProcedure, router } from "../trpc";

export const vaultsRouter = router({
    getAll: publicProcedure.query(async () => {
        return await VaultType.find({});
    }),
});
