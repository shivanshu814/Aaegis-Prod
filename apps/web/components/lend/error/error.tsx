interface ErrorProps {
    error: string;
}

const ErrorDisplay = ({ error }: ErrorProps) => {
    return (
        <div className="mb-6 rounded-xl p-4 bg-red-500/10 border border-red-500/20">
            <div className="text-red-400 text-sm">{error}</div>
        </div>
    );
};
export default ErrorDisplay;
