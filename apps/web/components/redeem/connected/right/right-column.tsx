"use client";

import VaultStats from "./vault-stats";
import RedeemInfo from "./redeem-info";
import type {
  BackendVaultData,
  BackendOracleData,
  BackendProtocolStateData,
} from "../../../../types";

interface RightColumnProps {
  vault: BackendVaultData | null;
  oracle: BackendOracleData | null;
  protocolState: BackendProtocolStateData | null;
}

const RightColumn = ({ vault, oracle, protocolState }: RightColumnProps) => {
  return (
    <>
      <VaultStats vault={vault} oracle={oracle} protocolState={protocolState} />
      <RedeemInfo vault={vault} oracle={oracle} protocolState={protocolState} />
    </>
  );
};
export default RightColumn;
