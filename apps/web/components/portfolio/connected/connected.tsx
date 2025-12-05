"use client";

import {
    useBackendOracleData,
    useBackendProtocolStateData,
    useBackendVaultData,
} from "@/hooks/backend/useBackendData";
import { useWalletConnection } from "@/hooks/wallet/useWalletConnection";
import LeftColumn from "./left/left-column";
import RightColumn from "./right/right-column";

const ConnectedPortfolio = () => {
    const { walletPubkey } = useWalletConnection();
    const { data: protocolState } = useBackendProtocolStateData(60000);
    const { data: oracle } = useBackendOracleData(120000);
    const { data: vault } = useBackendVaultData(walletPubkey, 30000);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <LeftColumn
                    vault={vault}
                    oracle={oracle}
                    protocolState={protocolState}
                />
            </div>
            <div className="lg:col-span-1">
                <RightColumn
                    vault={vault}
                    oracle={oracle}
                    protocolState={protocolState}
                />
            </div>
        </div>
    );
};

export default ConnectedPortfolio;
