
import React from 'react';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onSet?: (n: number) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ rating, interactive = false, onSet, size = 'md' }) => {
  const sizeClasses = {
    xs: 'text-[10px] gap-0.5',
    sm: 'text-sm gap-1',
    md: 'text-lg gap-1.5',
    lg: 'text-2xl gap-2'
  };

  return (
    <div className={`flex ${sizeClasses[size]}`}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onSet && onSet(star)}
          className={`transition-all ${star <= Math.round(rating) ? 'text-drxred drop-shadow-[0_0_5px_rgba(225,29,72,0.4)]' : 'text-zinc-800'} ${interactive ? 'hover:scale-125 hover:text-drxred' : ''}`}
        >
          {star <= Math.round(rating) ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
};

export default StarRating;
