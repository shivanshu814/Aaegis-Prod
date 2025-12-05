import { Wallet } from "lucide-react";

interface NotConnectedProps {
  connectWallet: () => void;
}

const NotConnected = ({ connectWallet }: NotConnectedProps) => {
  return (
    <div className='rounded-xl p-8 glass border border-white/10 text-center'>
      <Wallet className='w-16 h-16 text-white/60 mx-auto mb-4' />
      <h3 className='text-2xl font-semibold text-white mb-2'>
        Connect Wallet Required
      </h3>
      <p className='text-white/70 mb-6'>
        Connect your Solana wallet to start redeeming AGSUSD stablecoins and
        withdrawing your SOL collateral
      </p>
      <button
        onClick={connectWallet}
        className='px-8 py-4 rounded-xl text-white font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
        style={{
          background:
            "linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)",
        }}
      >
        Connect Wallet
      </button>
    </div>
  );
};
export default NotConnected;
