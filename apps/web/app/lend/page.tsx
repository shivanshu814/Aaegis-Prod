"use client";

import ConnectedLend from "@/components/lend/connected/connected";
import { useWalletConnection } from "@/hooks/wallet/useWalletConnection";
import ErrorDisplay from "../../components/lend/error/error";
import Header from "../../components/lend/header/header";
import NotConnected from "../../components/lend/not-connected/not-connected";

const LendingPage = () => {
  const {
    connectWallet,
    error: walletError,
    walletPubkey,
  } = useWalletConnection();

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="max-w-6xl mx-auto">
        <Header />
        {walletError && <ErrorDisplay error={walletError} />}
        {!walletPubkey ? (
          <NotConnected connectWallet={connectWallet} />
        ) : (
          <ConnectedLend />
        )}
      </div>
    </div>
  );
};
export default LendingPage;
