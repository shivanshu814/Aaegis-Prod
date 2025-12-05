"use client";

import type {
    BackendOracleData,
    BackendProtocolStateData,
    BackendVaultData,
} from "../../../../types";
import CollateralDetails from "./collateral-details";
import DebtOverview from "./debt-overview";
import PortfolioSummary from "./portfolio-summary";

interface LeftColumnProps {
    vault: BackendVaultData | null;
    oracle: BackendOracleData | null;
    protocolState: BackendProtocolStateData | null;
}

const LeftColumn = ({ vault, oracle, protocolState }: LeftColumnProps) => {
    return (
        <div className="space-y-6">
            <PortfolioSummary vault={vault} oracle={oracle} />
            <CollateralDetails vault={vault} oracle={oracle} protocolState={protocolState} />
            <DebtOverview vault={vault} oracle={oracle} protocolState={protocolState} />
        </div>
    );
};

export default LeftColumn;
