import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import DepositForm from "./deposit-form";
import MintForm from "./mint-form";
import RepayForm from "./repay-form";
import WithdrawForm from "./withdraw-form";

interface LeftColumnProps {
  solAmount: string;
  setSolAmount: (amount: string) => void;
  agsAmount: string;
  setAgsAmount: (amount: string) => void;
  activeTab: "deposit" | "withdraw";
  setActiveTab: (tab: "deposit" | "withdraw") => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  onMint: () => void;
  onRepay: () => void;
  vaultCollateral: number;
  vaultDebt: number;
}

const LeftColumn = ({
  solAmount,
  setSolAmount,
  agsAmount,
  setAgsAmount,
  activeTab,
  setActiveTab,
  onDeposit,
  onWithdraw,
  onMint,
  onRepay,
  vaultCollateral,
  vaultDebt,
}: LeftColumnProps) => {
  return (
    <div className="rounded-xl p-6 glass border border-white/10">
      <div className="mb-6">
        <div className="flex p-1 space-x-1 bg-white/5 rounded-xl border border-white/10">
          <button
            className={`w-full py-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === "deposit"
                ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg"
                : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            onClick={() => setActiveTab("deposit")}
          >
            <ArrowDownCircle className="w-4 h-4" />
            Deposit/Withdraw
          </button>
          <button
            className={`w-full py-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === "withdraw"
                ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg"
                : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            onClick={() => setActiveTab("withdraw")}
          >
            <ArrowUpCircle className="w-4 h-4" />
            Mint/Repay
          </button>
        </div>
      </div>

      {activeTab === "deposit" ? (
        <div className="space-y-6">
          <DepositForm
            amount={solAmount}
            setAmount={setSolAmount}
            onSubmit={onDeposit}
            maxAmount={vaultCollateral}
          />
          <WithdrawForm
            amount={solAmount}
            setAmount={setSolAmount}
            onSubmit={onWithdraw}
            maxAmount={vaultCollateral}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <MintForm
            amount={agsAmount}
            setAmount={setAgsAmount}
            onSubmit={onMint}
            maxAmount={vaultCollateral * 2}
          />
          <RepayForm
            amount={agsAmount}
            setAmount={setAgsAmount}
            onSubmit={onRepay}
            maxAmount={vaultDebt}
          />
        </div>
      )}
    </div>
  );
};

export default LeftColumn;
