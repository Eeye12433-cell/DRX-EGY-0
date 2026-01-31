import React from 'react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: 'inline' | 'card' | 'fullWidth';
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = 'Connection Error',
  message, 
  onRetry,
  variant = 'card',
  className = ''
}) => {
  const variants = {
    inline: 'p-4 border-l-4 border-drxred bg-drxred/5',
    card: 'p-8 border border-drxred/30 bg-drxred/5 text-center',
    fullWidth: 'p-12 border border-drxred/30 bg-drxred/5 text-center w-full'
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      <div className="flex flex-col items-center gap-4">
        {variant !== 'inline' && (
          <div className="w-14 h-14 bg-drxred/10 border-2 border-drxred/30 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
        )}
        <div className={variant === 'inline' ? 'flex-1' : 'space-y-2 text-center'}>
          <h4 className="text-sm font-bold font-oswald uppercase text-drxred tracking-wider">{title}</h4>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-wide">{message}</p>
        </div>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="mt-4 px-8 py-3 border border-drxred text-drxred font-mono text-[10px] uppercase tracking-widest hover:bg-drxred hover:text-white transition-all"
          >
            Retry Connection
          </button>
        )}
      </div>
    </div>
  );
};

// Specific AI Error States
export const AIRateLimitError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorState
    title="Rate Limit Exceeded"
    message="Too many requests. Please wait a moment and try again."
    onRetry={onRetry}
    variant="card"
  />
);

export const AICreditsError: React.FC = () => (
  <ErrorState
    title="AI Credits Exhausted"
    message="Please add funds to continue using AI features."
    variant="card"
  />
);

export const AIConnectionError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorState
    title="Connection Failed"
    message="Unable to reach AI services. Check your connection."
    onRetry={onRetry}
    variant="card"
  />
);

export default ErrorState;
