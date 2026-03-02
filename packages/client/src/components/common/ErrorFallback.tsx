import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error | string;
  resetError?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const message = typeof error === 'string' ? error : error?.message || 'Something went wrong';
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-monitor-high mb-4" />
      <h3 className="text-lg font-semibold text-gray-200 mb-2">Error</h3>
      <p className="text-gray-400 mb-4 max-w-md">{message}</p>
      {resetError && (
        <button
          onClick={resetError}
          className="px-4 py-2 bg-monitor-accent/20 text-monitor-accent rounded-lg hover:bg-monitor-accent/30 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
