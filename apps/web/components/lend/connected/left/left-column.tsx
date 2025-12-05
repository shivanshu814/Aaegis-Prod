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
  calculateCollateralValueUSD,
  calculateIsRiskyBorrow,
  calculateLiquidationLTV,
  calculateLTVFromAmounts,
  calculateMaxLTV,
  solToLamports,
} from "../../../../utils";
import ActionsPanel from "./actions-panel";
import Borrow from "./borrow";
import Deposit from "./deposit";
import LoanValue from "./loan-value";
import RiskWarning from "./risk-warning";

interface LeftColumnProps {
  vault: BackendVaultData | null;
  oracle: BackendOracleData | null;
  protocolState: BackendProtocolStateData | null;
  solAmount: string;
  setSolAmount: (value: string) => void;
  agsAmount: string;
  setAgsAmount: (value: string) => void;
  totalCollateralSOL: number;
  totalDebtAGSUSD: number;
  walletBalanceSOL: number;
  availableToBorrow: number;
  currentDebtAGSUSD: number;
}

const LeftColumn = ({
  vault,
  oracle,
  protocolState,
  solAmount,
  setSolAmount,
  agsAmount,
  setAgsAmount,
  totalCollateralSOL,
  totalDebtAGSUSD,
  walletBalanceSOL,
  availableToBorrow,
  currentDebtAGSUSD,
}: LeftColumnProps) => {
  const { walletPubkey, isSDKReady } = useWalletConnection();
  const { createVault, deposit, isLoading: isVaultLoading } = useVault();
  const { mintStablecoin, isLoading: isMinting } = useStablecoin();
  const { refetch: refetchVault } = useBackendVaultData(walletPubkey, 30000);
  const { refetch: refetchBalance } = useTokenBalance(walletPubkey, 30000);
  const { refetch: refetchOracle } = useBackendOracleData(120000);

  const [acknowledgeRisks, setAcknowledgeRisks] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [permitCompleted, setPermitCompleted] = useState(false);
  const [depositCompleted, setDepositCompleted] = useState(false);
  const [borrowCompleted, setBorrowCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    maxLTV,
    liquidationLTV,
    isRiskyBorrow,
    currentLTV,
    totalCollateralValueUSD,
    isLiquidationRiskZone,
  } = useMemo(() => {
    const maxLTV = calculateMaxLTV(protocolState);
    const liquidationLTV = calculateLiquidationLTV(protocolState);
    const isRiskyBorrow = calculateIsRiskyBorrow(
      totalCollateralSOL,
      totalDebtAGSUSD,
      oracle,
      protocolState
    );
    const currentLTV = calculateLTVFromAmounts(
      totalCollateralSOL,
      totalDebtAGSUSD,
      oracle
    );
    const totalCollateralValueUSD = calculateCollateralValueUSD(
      totalCollateralSOL,
      oracle
    );
    const isLiquidationRiskZone = currentLTV >= maxLTV * 0.95;
    return {
      maxLTV,
      liquidationLTV,
      isRiskyBorrow,
      currentLTV,
      totalCollateralValueUSD,
      isLiquidationRiskZone,
    };
  }, [protocolState, totalCollateralSOL, totalDebtAGSUSD, oracle]);

  const isLoading = isVaultLoading || isMinting || isProcessing;

  const handlePermit = async () => {
    // In Solana, we don't need ERC20-style permits - this is a UI step to show the flow
    setPermitCompleted(true);
    toast.success("Permission granted");
  };

  const handleDeposit = async () => {
    if (!isSDKReady || !walletPubkey) {
      toast.error("Please connect your wallet first");
      return;
    }

    const sol = parseFloat(solAmount) || 0;
    if (sol <= 0) {
      toast.error("Please enter a valid SOL amount");
      return;
    }

    setIsProcessing(true);
    try {
      if (!vault) {
        toast.loading("Creating vault...", { id: "create-vault" });
        await createVault(walletPubkey);
        await refetchVault();
        toast.success("Vault created successfully!", { id: "create-vault" });
      }

      const depositAmountLamports = solToLamports(sol);
      toast.loading(`Depositing ${sol} SOL...`, { id: "deposit" });
      await deposit(depositAmountLamports, walletPubkey);
      await refetchVault();

      setDepositCompleted(true);
      toast.success(`Successfully deposited ${sol} SOL!`, { id: "deposit" });
    } catch (error: any) {
      toast.error("Deposit failed", {
        id: "deposit",
        description:
          error.message || "Unknown error occurred. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBorrowAction = async () => {
    if (!isSDKReady || !walletPubkey) {
      toast.error("Please connect your wallet first");
      return;
    }

    const ags = parseFloat(agsAmount) || 0;
    if (ags <= 0) {
      toast.error("Please enter a valid AGSUSD amount");
      return;
    }

    if (!oracle || !protocolState) {
      toast.warning("Oracle or protocol state not available. Please wait...");
      return;
    }

    setIsProcessing(true);
    try {
      const mintAmountAGSUSD = agsUSDToUnits(ags);
      toast.loading(`Borrowing ${ags} AGSUSD...`, { id: "borrow" });
      const txSignature = await mintStablecoin(mintAmountAGSUSD, walletPubkey);

      setBorrowCompleted(true);
      const txDisplay =
        txSignature && typeof txSignature === "string"
          ? `Transaction: ${txSignature.slice(0, 8)}...${txSignature.slice(-8)}`
          : "Transaction completed successfully";
      toast.success(`Successfully borrowed ${ags} AGSUSD!`, {
        id: "borrow",
        description: txDisplay,
      });

      await refetchVault();
      await refetchBalance();
      await refetchOracle();
    } catch (error: any) {
      toast.error("Borrowing failed", {
        id: "borrow",
        description:
          error.message || "Unknown error occurred. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBorrowClick = () => {
    if (!isSDKReady) {
      toast.error("Please connect your wallet first");
      return;
    }

    const sol = parseFloat(solAmount) || 0;
    const ags = parseFloat(agsAmount) || 0;

    if (sol <= 0 && ags <= 0) {
      toast.error("Please enter valid amounts");
      return;
    }

    if (!oracle || !protocolState) {
      toast.warning("Oracle or protocol state not available. Please wait...");
      return;
    }

    if (currentLTV > maxLTV) {
      toast.error(
        `LTV cannot exceed ${maxLTV.toFixed(2)}%. Please reduce borrow amount.`
      );
      return;
    }

    if (!acknowledgeRisks) {
      toast.error("Please acknowledge the risks involved before borrowing.");
      return;
    }

    setShowActions(true);
    setPermitCompleted(false);
    setDepositCompleted(false);
    setBorrowCompleted(false);
  };

  return (
    <>
      <Deposit
        isSDKReady={isSDKReady}
        vault={vault}
        oracle={oracle}
        protocolState={protocolState}
        solAmount={solAmount}
        setSolAmount={setSolAmount}
        agsAmount={agsAmount}
        setAgsAmount={setAgsAmount}
        walletBalanceSOL={walletBalanceSOL}
      />
      <Borrow
        isSDKReady={isSDKReady}
        vault={vault}
        oracle={oracle}
        protocolState={protocolState}
        solAmount={solAmount}
        agsAmount={agsAmount}
        setAgsAmount={setAgsAmount}
        availableToBorrow={availableToBorrow}
      />
      <LoanValue
        oracle={oracle}
        protocolState={protocolState}
        agsAmount={agsAmount}
        setAgsAmount={setAgsAmount}
        currentLTV={currentLTV}
        maxLTV={maxLTV}
        liquidationLTV={liquidationLTV}
        totalCollateralValueUSD={totalCollateralValueUSD}
        availableToBorrow={availableToBorrow}
        currentDebtAGSUSD={currentDebtAGSUSD}
      />
      <RiskWarning
        acknowledgeRisks={acknowledgeRisks}
        setAcknowledgeRisks={setAcknowledgeRisks}
        isRiskyBorrow={isRiskyBorrow}
      />
      {/* Liquidation Risk Zone Warning */}
      {isLiquidationRiskZone && currentLTV > 0 && (
        <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
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
            <div className="text-sm font-semibold text-red-400 mb-1">
              Liquidation Risk Zone
            </div>
            <div className="text-xs text-red-300/80">
              Aap abhi Liquidation Risk Zone mein hain. Agar aap aur borrow
              karte hain, toh aapka position turant liquidate ho sakta hai.
              Kripya pehle apna LTV kam karein.
            </div>
          </div>
        </div>
      )}
      <button
        onClick={handleBorrowClick}
        disabled={
          !isSDKReady ||
          isLoading ||
          (!solAmount && !agsAmount) ||
          currentLTV > maxLTV ||
          !acknowledgeRisks ||
          isLiquidationRiskZone ||
          showActions
        }
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
          "Connect Wallet to Borrow"
        ) : isLiquidationRiskZone ? (
          "Cannot Borrow - Liquidation Risk"
        ) : showActions ? (
          "Actions in Progress"
        ) : (
          "Borrow AGSUSD"
        )}
      </button>
      <ActionsPanel
        showActions={showActions}
        setShowActions={setShowActions}
        permitCompleted={permitCompleted}
        setPermitCompleted={setPermitCompleted}
        depositCompleted={depositCompleted}
        setDepositCompleted={setDepositCompleted}
        borrowCompleted={borrowCompleted}
        setBorrowCompleted={setBorrowCompleted}
        solAmount={solAmount}
        agsAmount={agsAmount}
        isLoading={isLoading}
        handlePermit={handlePermit}
        handleDeposit={handleDeposit}
        handleBorrowAction={handleBorrowAction}
      />
    </>
  );
};
export default LeftColumn;
