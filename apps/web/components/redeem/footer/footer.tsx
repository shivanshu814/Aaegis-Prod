import { Activity, CheckCircle } from "lucide-react";
import type {
  BackendOracleData,
  BackendProtocolStateData,
} from "../../../types";
import { getSOLPriceUSD } from "../../../utils";

interface FooterProps {
  oracle: BackendOracleData | null;
  protocolState: BackendProtocolStateData | null;
}

const Footer = ({ oracle, protocolState }: FooterProps) => {
  const solPriceUSD = getSOLPriceUSD(oracle);

  return (
    <div className="rounded-xl p-6 bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Protocol Info</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-white/60 mb-1">Redeem Fee</div>
          <div className="text-lg font-semibold text-white">
            {protocolState
              ? `${(Number(protocolState.redeemFeeBps) / 10000) * 100}%`
              : "0.5%"}
          </div>
        </div>
        <div>
          <div className="text-sm text-white/60 mb-1">
            Min. Collateral Ratio
          </div>
          <div className="text-lg font-semibold text-white">
            {protocolState
              ? `${(Number(protocolState.collateralRatioBps) / 10000) * 100}%`
              : "150%"}
          </div>
        </div>
        <div>
          <div className="text-sm text-white/60 mb-1">SOL Price</div>
          <div className="text-lg font-semibold text-white">
            {solPriceUSD > 0 ? `$${solPriceUSD.toFixed(2)}` : "Loading..."}
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span>Protocol Status:</span>
          <div className="flex items-center gap-1 text-green-400 font-semibold">
            <CheckCircle className="w-3 h-3" />
            <span>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Footer;
