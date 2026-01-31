import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rectangular' }) => {
  const baseClasses = 'animate-pulse bg-zinc-800/50';
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-sm'
  };
  
  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
};

// Nutrition Result Skeleton
export const NutritionSkeleton: React.FC = () => (
  <div className="w-full space-y-8 relative z-10">
    <div className="bg-black/80 backdrop-blur-md border border-zinc-800 p-12">
      <Skeleton className="w-48 h-3 mb-4" />
      <Skeleton className="w-32 h-20 mb-4" />
      
      <div className="grid grid-cols-3 gap-8 mt-14 border-t border-white/5 pt-12">
        {[1, 2, 3].map(i => (
          <div key={i} className="text-center space-y-3">
            <Skeleton className="w-16 h-8 mx-auto" />
            <Skeleton className="w-20 h-3 mx-auto" />
            <Skeleton className="w-full h-1.5 mt-4" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Recommendation Card Skeleton
export const RecommendationCardSkeleton: React.FC = () => (
  <div className="bg-zinc-900/50 border border-zinc-800 p-6 flex flex-col">
    <Skeleton className="aspect-square mb-8 w-full" />
    <div className="flex-1 flex flex-col justify-between">
      <div className="space-y-3">
        <Skeleton className="w-20 h-3" />
        <Skeleton className="w-full h-6" />
      </div>
      <div className="flex justify-between items-end mt-6">
        <Skeleton className="w-24 h-8" />
        <Skeleton className="w-20 h-10" />
      </div>
    </div>
  </div>
);

// Chat Message Skeleton
export const ChatMessageSkeleton: React.FC = () => (
  <div className="flex justify-start">
    <div className="max-w-[80%] bg-zinc-900 border border-white/10 p-4 rounded-xl space-y-2">
      <Skeleton className="w-48 h-3" />
      <Skeleton className="w-64 h-3" />
      <Skeleton className="w-32 h-3" />
    </div>
  </div>
);

// Image Generation Skeleton
export const ImageGenerationSkeleton: React.FC = () => (
  <div className="aspect-square bg-black border border-zinc-800 flex flex-col items-center justify-center gap-4">
    <div className="w-16 h-16 border-4 border-drxred border-t-transparent rounded-full animate-spin" />
    <div className="space-y-2 text-center">
      <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest animate-pulse">Synthesizing Visual</p>
      <p className="text-[9px] font-mono text-zinc-600 uppercase">Lovable AI Processing...</p>
    </div>
  </div>
);

export default Skeleton;
