import { Info } from "lucide-react";
import type {
  BackendOracleData,
  BackendProtocolStateData,
  BackendVaultData,
} from "../../../../types";

interface RedeemInfoProps {
  vault: BackendVaultData | null;
  oracle: BackendOracleData | null;
  protocolState: BackendProtocolStateData | null;
}

const RedeemInfo = ({ vault, oracle, protocolState }: RedeemInfoProps) => {
  return (
    <div className="rounded-xl p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
      <div className="flex items-center gap-3 mb-3">
        <Info className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">
          How Redeeming Works
        </h3>
      </div>
      <ol className="text-white/80 text-sm space-y-2">
        <li className="flex gap-2">
          <span className="text-blue-400 font-semibold">1.</span>
          <span>Enter the amount of AGSUSD you want to burn</span>
        </li>
        <li className="flex gap-2">
          <span className="text-blue-400 font-semibold">2.</span>
          <span>System calculates the corresponding SOL you can withdraw</span>
        </li>
        <li className="flex gap-2">
          <span className="text-blue-400 font-semibold">3.</span>
          <span>
            Pay the redeem fee (
            {protocolState
              ? `${(Number(protocolState.redeemFeeBps) / 10000) * 100}%`
              : "0.5%"}
            )
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-blue-400 font-semibold">4.</span>
          <span>
            AGSUSD tokens are burned and SOL is released to your wallet
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-blue-400 font-semibold">5.</span>
          <span>Transaction completes in ~400ms on Solana</span>
        </li>
      </ol>
      <div className="mt-4 pt-4 border-t border-blue-500/20">
        <div className="text-xs text-white/70">
          <span className="font-semibold text-blue-400">Note:</span> You can
          redeem any amount up to your total minted AGSUSD. The collateral ratio
          must remain above the minimum threshold after redemption.
        </div>
      </div>
    </div>
  );
};
export default RedeemInfo;
