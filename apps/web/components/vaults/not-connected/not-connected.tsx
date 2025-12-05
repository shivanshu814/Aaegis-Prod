import { Wallet } from "lucide-react";

interface NotConnectedProps {
  connectWallet: () => void;
}

const NotConnected = ({ connectWallet }: NotConnectedProps) => {
  return (
    <div className="mb-8 rounded-xl p-8 glass border border-white/10 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
        <Wallet className="w-8 h-8 text-emerald-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        Connect Wallet to Manage Vaults
      </h3>
      <p className="text-white/70 mb-6 max-w-md mx-auto">
        Connect your Solana wallet to deposit collateral, mint AGS, and manage your vault positions
      </p>
      <button
        onClick={connectWallet}
        className="btn-gradient px-8 py-3 rounded-xl text-white font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
      >
        Connect Wallet
      </button>
    </div>
  );
};

export default NotConnected;
