"use client";

import {
    useBackendOracleData,
    useBackendProtocolStateData,
} from "@/hooks/backend/useBackendData";
import { useWalletConnection } from "@/hooks/wallet/useWalletConnection";
import ConnectedPortfolio from "../../components/portfolio/connected/connected";
import ErrorDisplay from "../../components/portfolio/error/error";
import Footer from "../../components/portfolio/footer/footer";
import Header from "../../components/portfolio/header/header";
import NotConnected from "../../components/portfolio/not-connected/not-connected";

const PortfolioPage = () => {
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
                        <ConnectedPortfolio />
                        <Footer oracle={oracle} protocolState={protocolState} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortfolioPage;
