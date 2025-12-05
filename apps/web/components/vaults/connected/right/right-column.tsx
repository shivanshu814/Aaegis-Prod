import { FC } from "react";
import VaultInfo from "./vault-info";
import VaultStats from "./vault-stats";

interface RightColumnProps {
  vaultCollateral: number;
  vaultDebt: number;
  oracle: any; // Replace with proper type
}

const RightColumn: FC<RightColumnProps> = ({
  vaultCollateral,
  vaultDebt,
  oracle,
}) => {
  // Calculate collateral ratio (in %)
  const collateralRatio =
    vaultCollateral > 0 ? (vaultDebt / vaultCollateral) * 100 : 0;

  // Calculate liquidation price (example calculation, adjust based on your logic)
  const liquidationPrice =
    vaultCollateral > 0 ? (vaultDebt * 1.5) / vaultCollateral : 0;

  return (
    <div className="space-y-6">
      <VaultInfo
        collateralRatio={collateralRatio}
        liquidationPrice={liquidationPrice}
        oraclePrice={oracle?.price || 0}
      />
      <VaultStats
        vaultCollateral={vaultCollateral}
        vaultDebt={vaultDebt}
        collateralRatio={collateralRatio}
      />
    </div>
  );
};

export default RightColumn;
