import { Wallet } from "lucide-react";

interface NotConnectedProps {
    connectWallet: () => void;
}
const NotConnected = ({ connectWallet }: NotConnectedProps) => {
    return (
        <div className="mb-8 rounded-xl p-6 glass border border-white/10 text-center">
            <Wallet className="w-12 h-12 text-white/60 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
                Connect Wallet Required
            </h3>
            <p className="text-white/70 mb-4">
                Connect your Solana wallet to start borrowing
            </p>
            <button
                onClick={connectWallet}
                className="btn-gradient px-6 py-3 rounded-xl text-white font-semibold"
            >
                Connect Wallet
            </button>
        </div>
    );
};

export default NotConnected;
