interface ErrorDisplayProps {
  error: Error | string | null;
}

const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  if (!error) return null;

  const errorMessage = typeof error === "string" ? error : error.message;

  return (
    <div className="mb-6 rounded-xl p-4 bg-red-500/10 border border-red-500/20">
      <div className="text-red-400 text-sm">{errorMessage}</div>
    </div>
  );
};

export default ErrorDisplay;
