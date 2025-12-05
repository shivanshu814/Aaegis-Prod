interface RiskWarningProps {
    acknowledgeRisks: boolean;
    setAcknowledgeRisks: (value: boolean) => void;
    isRiskyBorrow?: boolean;
}

const RiskWarning = ({
    acknowledgeRisks,
    setAcknowledgeRisks,
    isRiskyBorrow = false,
}: RiskWarningProps) => {
    return (
        <div
            className={`rounded-xl p-4 border ${isRiskyBorrow
                    ? "bg-red-500/10 border-red-500/20"
                    : "bg-white/5 border-white/10"
                }`}
        >
            {isRiskyBorrow && (
                <div className='flex items-start gap-3 mb-4'>
                    <div className='w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5'>
                        <span className='text-white text-xs font-bold'>!</span>
                    </div>
                    <div className='flex-1'>
                        <p className='text-sm text-red-400 font-medium'>
                            Borrowing this amount puts you at risk of quick liquidation. You
                            may lose part of your collateral.
                        </p>
                    </div>
                </div>
            )}
            <div
                className={`flex items-center gap-3 ${isRiskyBorrow ? "pt-4 border-t border-red-500/20" : ""}`}
            >
                <button
                    onClick={() => setAcknowledgeRisks(!acknowledgeRisks)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${acknowledgeRisks ? "bg-green-500" : "bg-white/20"
                        }`}
                >
                    <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${acknowledgeRisks ? "translate-x-5" : "translate-x-0"
                            }`}
                    />
                </button>
                <span className='text-sm text-white/80'>
                    I acknowledge risks involved
                </span>
            </div>
        </div>
    );
};
export default RiskWarning;
