"use client";

import {
  useBackendOracleData,
  useBackendProtocolStateData,
  useBackendVaultData,
} from "@/hooks/backend/useBackendData";
import { useWalletConnection } from "@/hooks/wallet/useWalletConnection";
import { useState, useMemo } from "react";
import {
  getVaultCollateralSOL,
  getVaultDebtAGSUSD,
} from "../../../utils";
import LeftColumn from "./left/left-column";
import RightColumn from "./right/right-column";

const ConnectedRedeem = () => {
  // Get backend data
  const { walletPubkey, isSDKReady } = useWalletConnection();
  const { data: protocolState } = useBackendProtocolStateData(60000);
  const { data: oracle } = useBackendOracleData(120000);
  const { data: vault } = useBackendVaultData(walletPubkey, 30000);

  // State for SOL and AGS amounts
  const [solAmount, setSolAmount] = useState("");
  const [agsAmount, setAgsAmount] = useState("");

  // Get current vault data
  const vaultCollateral = useMemo(() => getVaultCollateralSOL(vault), [vault]);
  const vaultDebt = useMemo(() => getVaultDebtAGSUSD(vault), [vault]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <LeftColumn
          vault={vault}
          oracle={oracle}
          protocolState={protocolState}
          solAmount={solAmount}
          setSolAmount={setSolAmount}
          agsAmount={agsAmount}
          setAgsAmount={setAgsAmount}
        />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <RightColumn
          vault={vault}
          oracle={oracle}
          protocolState={protocolState}
        />
      </div>
    </div>
  );
};
export default ConnectedRedeem;
