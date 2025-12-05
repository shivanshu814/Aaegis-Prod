"use client";

import {
  useBackendOracleData,
  useBackendVaultData,
} from "@/hooks/backend/useBackendData";
import { useVault } from "@/hooks/transactions/useVault";
import { getVaultCollateralSOL, getVaultDebtAGSUSD } from "@/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useMemo, useState } from "react";
import LeftColumn from "./left/left-column";
import RightColumn from "./right/right-column";

const ConnectedVault = () => {
  const { publicKey } = useWallet();
  const { data: oracle } = useBackendOracleData(120000);
  const { data: vault, refetch: refetchVault } = useBackendVaultData(
    publicKey ? publicKey.toBase58() : null,
    30000
  );

  const { deposit, withdraw, mint, repay, isLoading: isTxLoading } = useVault();

  const [solAmount, setSolAmount] = useState("");
  const [agsAmount, setAgsAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [error, setError] = useState<string | null>(null);

  const vaultCollateral = useMemo(() => getVaultCollateralSOL(vault), [vault]);
  const vaultDebt = useMemo(() => getVaultDebtAGSUSD(vault), [vault]);

  const handleDeposit = useCallback(async () => {
    if (!publicKey || !solAmount) return;

    const amount = parseFloat(solAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Invalid amount");
      return;
    }

    try {
      await deposit(amount * 1e9, publicKey.toBase58());
      setSolAmount("");
      await refetchVault();
    } catch (err: any) {
      console.error("Deposit failed:", err);
      setError(err.message || "Deposit failed");
    }
  }, [solAmount, publicKey, deposit, refetchVault]);

  const handleWithdraw = useCallback(async () => {
    if (!publicKey || !solAmount) return;

    const amount = parseFloat(solAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Invalid amount");
      return;
    }

    try {
      await withdraw(amount * 1e9, publicKey.toBase58());
      setSolAmount("");
      await refetchVault();
    } catch (err: any) {
      console.error("Withdrawal failed:", err);
      setError(err.message || "Withdrawal failed");
    }
  }, [solAmount, publicKey, withdraw, refetchVault]);

  const handleMint = useCallback(async () => {
    if (!publicKey || !agsAmount) return;

    const amount = parseFloat(agsAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Invalid amount");
      return;
    }

    try {
      await mint(amount * 1e6, publicKey.toBase58());
      setAgsAmount("");
      await refetchVault();
    } catch (err: any) {
      console.error("Mint failed:", err);
      setError(err.message || "Mint failed");
    }
  }, [agsAmount, publicKey, mint, refetchVault]);

  const handleRepay = useCallback(async () => {
    if (!publicKey || !agsAmount) return;

    const amount = parseFloat(agsAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Invalid amount");
      return;
    }

    try {
      await repay(amount * 1e6, publicKey.toBase58());
      setAgsAmount("");
      await refetchVault();
    } catch (err: any) {
      console.error("Repayment failed:", err);
      setError(err.message || "Repayment failed");
    }
  }, [agsAmount, publicKey, repay, refetchVault]);

  if (isTxLoading) {
    return (
      <div className="text-center text-gray-400">Processing transaction...</div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-red-500 bg-red-900 bg-opacity-20 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <LeftColumn
          solAmount={solAmount}
          setSolAmount={setSolAmount}
          agsAmount={agsAmount}
          setAgsAmount={setAgsAmount}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          onMint={handleMint}
          onRepay={handleRepay}
          vaultCollateral={vaultCollateral}
          vaultDebt={vaultDebt}
        />
      </div>
      <div className="md:col-span-1">
        <RightColumn
          vaultCollateral={vaultCollateral}
          vaultDebt={vaultDebt}
          oracle={oracle}
        />
      </div>
    </div>
  );
};

export default ConnectedVault;
