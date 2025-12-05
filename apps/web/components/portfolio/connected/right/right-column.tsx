"use client";

import type {
    BackendOracleData,
    BackendProtocolStateData,
    BackendVaultData,
} from "../../../../types";
import HealthFactor from "./health-factor";
import QuickActions from "./quick-actions";

interface RightColumnProps {
    vault: BackendVaultData | null;
    oracle: BackendOracleData | null;
    protocolState: BackendProtocolStateData | null;
}

const RightColumn = ({ vault, oracle, protocolState }: RightColumnProps) => {
    return (
        <div className="space-y-6">
            <HealthFactor vault={vault} oracle={oracle} protocolState={protocolState} />
            <QuickActions />
        </div>
    );
};

export default RightColumn;
