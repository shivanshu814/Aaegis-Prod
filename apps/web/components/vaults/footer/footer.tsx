import { Activity, CheckCircle, DollarSign, Shield } from "lucide-react";

interface FooterProps {
  oracle: any; // Replace with proper type
  protocolState: any; // Replace with proper type
}

const Footer = ({ oracle, protocolState }: FooterProps) => {
  return (
    <div className="rounded-xl p-6 bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">Protocol Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Protocol Stats */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-white/80">Protocol Stats</h4>
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">Total Value Locked</div>
            <div className="text-lg font-semibold text-white">
              ${(oracle?.totalValueLocked || 0).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">Total AGS Minted</div>
            <div className="text-lg font-semibold text-white">
              {(oracle?.totalAgsMinted || 0).toLocaleString()} AGS
            </div>
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">Collateral Ratio</div>
            <div className="text-lg font-semibold text-white">
              {protocolState?.collateralRatioBps
                ? (protocolState.collateralRatioBps / 100).toFixed(2) + "%"
                : "N/A"}
            </div>
          </div>
        </div>

        {/* Fees */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-semibold text-white/80">Fees</h4>
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">Mint Fee</div>
            <div className="text-lg font-semibold text-white">
              {protocolState?.mintFeeBps
                ? (protocolState.mintFeeBps / 100).toFixed(2) + "%"
                : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">Redeem Fee</div>
            <div className="text-lg font-semibold text-white">
              {protocolState?.redeemFeeBps
                ? (protocolState.redeemFeeBps / 100).toFixed(2) + "%"
                : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">Liquidation Fee</div>
            <div className="text-lg font-semibold text-white">
              {protocolState?.liquidationFeeBps
                ? (protocolState.liquidationFeeBps / 100).toFixed(2) + "%"
                : "N/A"}
            </div>
          </div>
        </div>

        {/* Risk Parameters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-white/80">Risk Parameters</h4>
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">Liquidation Threshold</div>
            <div className="text-lg font-semibold text-white">
              {protocolState?.liquidationThresholdBps
                ? (protocolState.liquidationThresholdBps / 100).toFixed(2) + "%"
                : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">Min Collateral Ratio</div>
            <div className="text-lg font-semibold text-white">
              {protocolState?.minCollateralRatioBps
                ? (protocolState.minCollateralRatioBps / 100).toFixed(2) + "%"
                : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">Oracle Price</div>
            <div className="text-lg font-semibold text-white">
              ${oracle?.price ? oracle.price.toFixed(2) : "N/A"}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span>Protocol Status:</span>
            <div className="flex items-center gap-1 text-green-400 font-semibold">
              <CheckCircle className="w-3 h-3" />
              <span>Active</span>
            </div>
          </div>
          <div className="text-xs text-white/60">
            Maintain healthy collateral ratio to avoid liquidation
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
