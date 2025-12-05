"use client";

import type {
  BackendOracleData,
  BackendProtocolStateData,
  BackendVaultData,
} from "../../../../types";
import BorrowRate from "./borrow-rate";
import HealthFactor from "./health-factor";

interface RightColumnProps {
  vault: BackendVaultData | null;
  oracle: BackendOracleData | null;
  protocolState: BackendProtocolStateData | null;
  agsAmount: string;
  totalCollateralSOL: number;
  totalDebtAGSUSD: number;
}

const RightColumn = ({
  vault,
  oracle,
  protocolState,
  agsAmount,
  totalCollateralSOL,
  totalDebtAGSUSD,
}: RightColumnProps) => {
  return (
    <>
      <BorrowRate
        vault={vault}
        oracle={oracle}
        protocolState={protocolState}
        totalCollateralSOL={totalCollateralSOL}
        totalDebtAGSUSD={totalDebtAGSUSD}
      />
      {parseFloat(agsAmount) > 0 && (
        <HealthFactor
          vault={vault}
          oracle={oracle}
          protocolState={protocolState}
          totalCollateralSOL={totalCollateralSOL}
          totalDebtAGSUSD={totalDebtAGSUSD}
        />
      )}
    </>
  );
};
export default RightColumn;
