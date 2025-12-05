"use client";

import {
  useBackendOracleData,
  useBackendProtocolStateData,
  useBackendVaultData,
} from "@/hooks/backend/useBackendData";
import { useSDK } from "@/hooks/sdk/useSDK";
import { useWalletConnection } from "@/hooks/wallet/useWalletConnection";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import {
  calculateAvailableToBorrow,
  calculateTotalCollateralSOL,
  calculateTotalDebtAGSUSD,
  getVaultCollateralSOL,
  getVaultDebtAGSUSD,
} from "../../../utils";
import Footer from "../footer/footer";
import LeftColumn from "./left/left-column";
import RightColumn from "./right/right-column";

const ConnectedLend = () => {
  // Get backend data
  const { walletPubkey, isSDKReady } = useWalletConnection();
  const { connection } = useSDK();
  const { data: protocolState } = useBackendProtocolStateData(60000);
  const { data: oracle } = useBackendOracleData(120000);
  const { data: vault } = useBackendVaultData(walletPubkey, 30000);

  // State for SOL and AGS amounts
  const [solAmount, setSolAmount] = useState("");
  const [agsAmount, setAgsAmount] = useState("");
  const [walletBalanceSOL, setWalletBalanceSOL] = useState<number>(0);

  // Fetch wallet SOL balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletPubkey || !connection) {
        setWalletBalanceSOL(0);
        return;
      }
      try {
        const publicKey = new PublicKey(walletPubkey);
        const balance = await connection.getBalance(publicKey);
        setWalletBalanceSOL(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error("Failed to fetch wallet balance:", error);
        setWalletBalanceSOL(0);
      }
    };

    if (isSDKReady && walletPubkey) {
      fetchBalance();
      // Refresh balance every 10 seconds
      const interval = setInterval(fetchBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [walletPubkey, connection, isSDKReady]);

  // Get current collateral SOL
  const currentCollateralSOL = useMemo(
    () => getVaultCollateralSOL(vault),
    [vault]
  );

  // Get current debt AGSUSD
  const currentDebtAGSUSD = useMemo(() => getVaultDebtAGSUSD(vault), [vault]);

  // Get total collateral SOL
  const totalCollateralSOL = useMemo(
    () =>
      calculateTotalCollateralSOL(
        currentCollateralSOL,
        parseFloat(solAmount) || 0
      ),
    [currentCollateralSOL, solAmount]
  );

  // Get total debt AGSUSD
  const totalDebtAGSUSD = useMemo(
    () =>
      calculateTotalDebtAGSUSD(currentDebtAGSUSD, parseFloat(agsAmount) || 0),
    [currentDebtAGSUSD, agsAmount]
  );

  // Calculate available to borrow
  const availableToBorrow = useMemo(
    () =>
      calculateAvailableToBorrow(
        totalCollateralSOL,
        currentDebtAGSUSD,
        oracle,
        protocolState
      ),
    [totalCollateralSOL, currentDebtAGSUSD, oracle, protocolState]
  );

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
          totalCollateralSOL={totalCollateralSOL}
          totalDebtAGSUSD={totalDebtAGSUSD}
          walletBalanceSOL={walletBalanceSOL}
          availableToBorrow={availableToBorrow}
          currentDebtAGSUSD={currentDebtAGSUSD}
        />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <RightColumn
          vault={vault}
          oracle={oracle}
          protocolState={protocolState}
          agsAmount={agsAmount}
          totalCollateralSOL={totalCollateralSOL}
          totalDebtAGSUSD={totalDebtAGSUSD}
        />
      </div>
      <div className="lg:col-span-3">
        <Footer oracle={oracle} protocolState={protocolState} />
      </div>
    </div>
  );
};
export default ConnectedLend;
