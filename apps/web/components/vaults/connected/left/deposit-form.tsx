import { ArrowDown } from "lucide-react";

interface DepositFormProps {
  amount: string;
  setAmount: (amount: string) => void;
  onSubmit: () => void;
  maxAmount: number;
}

const DepositForm = ({
  amount,
  setAmount,
  onSubmit,
  maxAmount,
}: DepositFormProps) => {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <ArrowDown className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">Deposit SOL</h3>
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="deposit-amount" className="text-sm text-white/70">
            Amount (SOL)
          </label>
          <button
            type="button"
            onClick={() => setAmount(maxAmount.toString())}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            Max: {maxAmount.toFixed(4)} SOL
          </button>
        </div>
        <div className="relative">
          <input
            id="deposit-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full p-3 pr-16 text-white bg-black/30 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-white/30"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-white/60 font-semibold">SOL</span>
          </div>
        </div>
      </div>
      <button
        onClick={onSubmit}
        disabled={
          !amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmount
        }
        className="w-full px-4 py-3 font-semibold text-white rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 btn-gradient"
      >
        Deposit SOL
      </button>
    </div>
  );
};

export default DepositForm;
