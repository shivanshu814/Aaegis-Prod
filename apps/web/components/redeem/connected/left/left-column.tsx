import {
  useBackendOracleData,
  useBackendVaultData,
} from "@/hooks/backend/useBackendData";
import { useStablecoin } from "@/hooks/transactions/useStablecoin";
import { useTokenBalance } from "@/hooks/transactions/useTokenBalance";
import { useVault } from "@/hooks/transactions/useVault";
import { useWalletConnection } from "@/hooks/wallet/useWalletConnection";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  BackendOracleData,
  BackendProtocolStateData,
  BackendVaultData,
} from "../../../../types";
import {
  agsUSDToUnits,
  calculateMaxLTV,
  calculateNewCollateralRatio,
  getVaultCollateralSOL,
  getVaultDebtAGSUSD,
  solToLamports,
} from "../../../../utils";
import Burn from "./burn";
import RedeemSummary from "./redeem-summary";
import Withdraw from "./withdraw";

interface LeftColumnProps {
  vault: BackendVaultData | null;
  oracle: BackendOracleData | null;
  protocolState: BackendProtocolStateData | null;
  solAmount: string;
  setSolAmount: (value: string) => void;
  agsAmount: string;
  setAgsAmount: (value: string) => void;
}

const LeftColumn = ({
  vault,
  oracle,
  protocolState,
  solAmount,
  setSolAmount,
  agsAmount,
  setAgsAmount,
}: LeftColumnProps) => {
  const { walletPubkey, isSDKReady } = useWalletConnection();
  const { withdraw, isLoading: isVaultLoading } = useVault();
  const { redeemStablecoin, isLoading: isRepaying } = useStablecoin();
  const { refetch: refetchVault } = useBackendVaultData(walletPubkey, 30000);
  const {
    balanceFormatted: agsBalance,
    balance: agsBalanceRaw,
    refetch: refetchBalance,
  } = useTokenBalance(walletPubkey, 30000);
  const { refetch: refetchOracle } = useBackendOracleData(120000);

  const [isProcessing, setIsProcessing] = useState(false);

  const vaultCollateral = useMemo(() => getVaultCollateralSOL(vault), [vault]);
  const vaultDebt = useMemo(() => getVaultDebtAGSUSD(vault), [vault]);

  const isLoading = isVaultLoading || isRepaying || isProcessing;

  const handleRedeemClick = async () => {
    if (!isSDKReady || !walletPubkey) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!vault) {
      toast.error("No vault found. Please create a vault first.");
      return;
    }

    const ags = parseFloat(agsAmount) || 0;
    const sol = parseFloat(solAmount) || 0;

    if (ags <= 0 || sol <= 0) {
      toast.error("Please enter valid amounts");
      return;
    }

    if (ags > vaultDebt) {
      toast.error(`Cannot redeem more than ${vaultDebt.toFixed(2)} AGSUSD`);
      return;
    }

    if (sol > vaultCollateral) {
      toast.error(
        `Cannot withdraw more than ${vaultCollateral.toFixed(4)} SOL`
      );
      return;
    }

    if (!oracle || !protocolState) {
      toast.warning("Oracle or protocol state not available. Please wait...");
      return;
    }

    // Check token balance before attempting to repay
    // balance is already in AGSUSD format (not units), so compare directly
    // Only check if balance is loaded (not null) and less than required amount
    if (agsBalanceRaw !== null && agsBalanceRaw !== undefined) {
      const userBalanceAGSUSD = Number(agsBalanceRaw);
      if (userBalanceAGSUSD < ags) {
        toast.error(`Insufficient AGSUSD balance!`, {
          description: `You are trying to burn: ${ags.toFixed(2)} AGSUSD\nYour available balance: ${userBalanceAGSUSD.toFixed(2)} AGSUSD\n\nPlease ensure you have enough AGSUSD tokens in your wallet.`,
          duration: 5000,
        });
        return;
      }
    }
    // If balance is null/undefined (still loading), allow transaction to proceed
    // SDK will handle the actual balance check

    // Convert to units for the transaction
    const repayAmountAGSUSD = agsUSDToUnits(ags);

    setIsProcessing(true);
    try {
      // First, repay/burn AGSUSD stablecoins
      toast.loading(`Burning ${ags} AGSUSD...`, { id: "burn" });
      const repayTx = await redeemStablecoin(repayAmountAGSUSD, walletPubkey);
      if (!repayTx) {
        throw new Error("Failed to repay stablecoin");
      }
      toast.success(`Successfully burned ${ags} AGSUSD!`, { id: "burn" });

      // Then, withdraw SOL collateral
      const withdrawAmountLamports = solToLamports(sol);
      toast.loading(`Withdrawing ${sol} SOL...`, { id: "withdraw" });
      await withdraw(withdrawAmountLamports, walletPubkey);

      toast.success(
        `Successfully redeemed ${ags} AGSUSD and withdrew ${sol} SOL!`,
        {
          id: "withdraw",
          description: "Your transaction has been completed successfully.",
        }
      );

      // Refresh data
      await refetchVault();
      await refetchBalance();
      await refetchOracle();

      // Reset form
      setAgsAmount("");
      setSolAmount("");
    } catch (error: any) {
      console.error("Redemption failed:", error);

      // Parse error message for better user feedback
      let errorMessage = "Unknown error";
      let errorDescription = "";

      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      // Check for insufficient funds error
      if (
        errorMessage.includes("insufficient funds") ||
        errorMessage.includes("InsufficientFunds") ||
        error?.transactionLogs?.some(
          (log: string) =>
            log.includes("insufficient funds") ||
            log.includes("Error: insufficient funds")
        )
      ) {
        const availableBalance = agsBalanceRaw
          ? (Number(agsBalanceRaw) / 1e6).toFixed(2)
          : "0.00";
        errorMessage = "Insufficient AGSUSD balance!";
        errorDescription = `You tried to burn: ${ags.toFixed(2)} AGSUSD\nYour available balance: ${availableBalance} AGSUSD\n\nPlease ensure you have enough AGSUSD tokens in your wallet.`;
      } else if (errorMessage.includes("custom program error: 0x1")) {
        errorMessage = "Transaction failed";
        errorDescription =
          "This usually means:\n1. Insufficient AGSUSD balance in your wallet\n2. Insufficient SOL for transaction fees\n3. Network congestion\n\nPlease check your balances and try again.";
      }

      toast.error(errorMessage, {
        id: "withdraw",
        description: errorDescription || errorMessage,
        duration: 6000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate new collateral ratio after redeem
  const newCollateralRatio = useMemo(() => {
    if (!vault || !oracle) return 0;
    return calculateNewCollateralRatio(
      vaultCollateral,
      vaultDebt,
      parseFloat(solAmount) || 0,
      parseFloat(agsAmount) || 0,
      oracle
    );
  }, [vault, oracle, vaultCollateral, vaultDebt, solAmount, agsAmount]);

  // Check if redeem would put position at risk
  const maxLTV = calculateMaxLTV(protocolState);
  const isRiskyRedeem =
    newCollateralRatio < 200 && newCollateralRatio !== Infinity;

  return (
    <>
      <Burn
        isSDKReady={isSDKReady}
        vault={vault}
        oracle={oracle}
        protocolState={protocolState}
        agsAmount={agsAmount}
        setAgsAmount={setAgsAmount}
        agsusdBalance={agsBalance || "0.00"}
      />
      <Withdraw
        isSDKReady={isSDKReady}
        vault={vault}
        oracle={oracle}
        protocolState={protocolState}
        solAmount={solAmount}
        setSolAmount={setSolAmount}
        agsAmount={agsAmount}
        setAgsAmount={setAgsAmount}
      />
      <RedeemSummary
        vault={vault}
        oracle={oracle}
        protocolState={protocolState}
        agsAmount={agsAmount}
        solAmount={solAmount}
        vaultDebt={vaultDebt}
        vaultCollateral={vaultCollateral}
      />
      {/* Low Collateral Ratio Warning */}
      {isRiskyRedeem && agsAmount && solAmount && (
        <div className="rounded-xl p-4 bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <div className="text-sm font-semibold text-yellow-400 mb-1">
              Low Collateral Ratio Warning
            </div>
            <div className="text-xs text-yellow-300/80">
              Your new collateral ratio will be {newCollateralRatio.toFixed(1)}
              %, which is close to the minimum required{" "}
              {protocolState
                ? `${(Number(protocolState.collateralRatioBps) / 10000) * 100}%`
                : "150%"}
              . Consider redeeming less AGSUSD to maintain a safer position.
            </div>
          </div>
        </div>
      )}
      <button
        onClick={handleRedeemClick}
        disabled={!isSDKReady || isLoading || !agsAmount || !solAmount}
        className="w-full px-6 py-4 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        style={{
          background:
            "linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)",
        }}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Processing...
          </>
        ) : !isSDKReady ? (
          "Connect Wallet to Redeem"
        ) : (
          "Redeem AGSUSD & Withdraw SOL"
        )}
      </button>
    </>
  );
};
export default LeftColumn;
