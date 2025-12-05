import { ProtocolState } from "../models/ProtocolState";
import { publicProcedure, router } from "../trpc";

export const protocolRouter = router({
    getStats: publicProcedure.query(async () => {
        return await ProtocolState.findOne({});
    }),
});
