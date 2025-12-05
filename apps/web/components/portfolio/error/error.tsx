import { AlertCircle } from "lucide-react";

interface ErrorProps {
    error: string;
}

const ErrorDisplay = ({ error }: ErrorProps) => {
    return (
        <div className="mb-6 rounded-xl p-4 bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="text-red-400 text-sm">{error}</div>
        </div>
    );
};

export default ErrorDisplay;
