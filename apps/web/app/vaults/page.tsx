"use client";

import {
  useBackendOracleData,
  useBackendProtocolStateData,
} from "@/hooks/backend/useBackendData";
import { useWalletConnection } from "@/hooks/wallet/useWalletConnection";
import ConnectedVault from "../../components/vaults/connected/connected";
import ErrorDisplay from "../../components/vaults/error/error";
import Footer from "../../components/vaults/footer/footer";
import Header from "../../components/vaults/header/header";
import NotConnected from "../../components/vaults/not-connected/not-connected";

const VaultsPage = () => {
  const {
    connectWallet,
    error: walletError,
    isSDKReady,
  } = useWalletConnection();

  const { data: oracle } = useBackendOracleData(120000);
  const { data: protocolState } = useBackendProtocolStateData(60000);

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="max-w-6xl mx-auto">
        <Header />
        {walletError && <ErrorDisplay error={walletError} />}
        {!isSDKReady ? (
          <NotConnected connectWallet={connectWallet} />
        ) : (
          <div className="space-y-6">
            <ConnectedVault />
            <Footer oracle={oracle} protocolState={protocolState} />
          </div>
        )}
      </div>
    </div>
  );
};
export default VaultsPage;
