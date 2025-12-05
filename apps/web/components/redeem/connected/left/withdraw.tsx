import { Info, ArrowDown } from "lucide-react";
import {
  calculateSolFromAgsForRedeem,
  formatSOL,
  formatUSD,
  getVaultCollateralSOL,
  getVaultDebtAGSUSD,
  calculateCollateralValueUSD,
  getSOLPriceUSD,
} from "../../../../utils";
import type {
  BackendVaultData,
  BackendOracleData,
  BackendProtocolStateData,
} from "../../../../types";
import { useMemo, useCallback } from "react";

interface WithdrawProps {
  isSDKReady: boolean;
  vault: BackendVaultData | null;
  oracle: BackendOracleData | null;
  protocolState: BackendProtocolStateData | null;
  solAmount: string;
  setSolAmount: (value: string) => void;
  agsAmount: string;
  setAgsAmount: (value: string) => void;
}

const Withdraw = ({
  isSDKReady,
  vault,
  oracle,
  protocolState,
  solAmount,
  setSolAmount,
  agsAmount,
  setAgsAmount,
}: WithdrawProps) => {
  // Get current vault data
  const currentCollateralSOL = useMemo(
    () => getVaultCollateralSOL(vault),
    [vault]
  );
  const currentDebtAGSUSD = useMemo(() => getVaultDebtAGSUSD(vault), [vault]);

  // Get current collateral value in USD
  const currentCollateralValueUSD = useMemo(
    () => calculateCollateralValueUSD(currentCollateralSOL, oracle),
    [currentCollateralSOL, oracle]
  );

  // Get SOL price
  const solPriceUSD = getSOLPriceUSD(oracle);

  // Handle SOL amount change
  const handleSolAmountChange = useCallback(
    (value: string) => {
      setSolAmount(value);
      // Auto-calculate AGSUSD amount based on SOL
      const sol = parseFloat(value) || 0;
      if (sol > 0 && currentDebtAGSUSD > 0 && currentCollateralSOL > 0) {
        const ratio = sol / currentCollateralSOL;
        const agsToRedeem = currentDebtAGSUSD * ratio;
        setAgsAmount(agsToRedeem.toFixed(2));
      }
    },
    [currentDebtAGSUSD, currentCollateralSOL, setAgsAmount, setSolAmount]
  );

  // Calculate withdraw USD value
  const withdrawUSDValue = useMemo(() => {
    const sol = parseFloat(solAmount) || 0;
    return sol * solPriceUSD;
  }, [solAmount, solPriceUSD]);

  return (
    <div className='rounded-xl p-6 bg-white/5 border border-white/10'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <h2 className='text-xl font-semibold text-white'>Withdraw SOL</h2>
          <div className='relative group'>
            <Info className='w-4 h-4 text-white/60 cursor-help hover:text-white/80 transition-colors' />
            <div className='absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64'>
              <div className='bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl border border-white/10'>
                <div className='font-semibold mb-1 text-white'>
                  Withdraw SOL Collateral
                </div>
                <div className='text-white/70 leading-relaxed'>
                  After burning AGSUSD, you can withdraw the corresponding SOL
                  collateral back to your wallet.
                </div>
                <div className='absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'></div>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            const input = document.querySelectorAll(
              'input[placeholder="0.00"]'
            )[1] as HTMLInputElement;
            if (input) input.focus();
          }}
          className='flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors'
        >
          <ArrowDown className='w-4 h-4' />
          Withdraw more
        </button>
      </div>

      <div className='space-y-4'>
        {/* Asset Selector */}
        <div className='flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10'>
          <div className='w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white/5'>
            <img
              src='https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png'
              alt='SOL'
              className='w-full h-full object-cover'
            />
          </div>
          <div className='flex-1'>
            <div className='text-sm text-white/60'>Asset</div>
            <div className='text-white font-semibold'>SOL</div>
          </div>
          <div className='text-right'>
            <div className='text-sm text-white/60'>Deposited</div>
            <div className='text-white font-semibold'>
              {formatSOL(currentCollateralSOL)}
            </div>
            <div className='text-xs text-white/60'>
              {formatUSD(currentCollateralValueUSD)}
            </div>
          </div>
        </div>

        {/* Withdraw Amount Input */}
        <div>
          <div className='flex items-center justify-between mb-2'>
            <label className='text-sm text-white/60'>Amount to Withdraw</label>
            {currentCollateralSOL > 0 && (
              <span className='text-xs text-white/40'>
                Max Withdrawable: {formatSOL(currentCollateralSOL)}
              </span>
            )}
          </div>
          <input
            type='number'
            placeholder='0.00'
            value={solAmount}
            onChange={(e) => handleSolAmountChange(e.target.value)}
            className='w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50'
            disabled={!isSDKReady}
          />
          {/* Withdraw USD Value */}
          {solAmount && (
            <div className='mt-2 text-sm text-white/60'>
              USD Value: {formatUSD(withdrawUSDValue)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Withdraw;
