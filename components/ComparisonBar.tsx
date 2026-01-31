import React from 'react';
import { Product } from '../types';

interface ComparisonBarProps {
  items: Product[];
  onRemove: (id: string) => void;
  onCompare: () => void;
  lang: 'ar' | 'en';
}

const ComparisonBar: React.FC<ComparisonBarProps> = ({ items, onRemove, onCompare, lang }) => {
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[450] bg-black/90 border-t border-white/10 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar">
          {items.map(p => (
            <div key={p.id} className="relative group">
              <img 
                src={p.imageUrl || p.image} 
                className="w-10 h-10 rounded-full border-2 border-bg-card object-cover bg-black" 
                alt="" 
                onError={(e) => { const img = e.currentTarget as HTMLImageElement; if (img.src !== p.image) img.src = p.image; } }
              />
              <button 
                onClick={() => onRemove(p.id)}
                className="absolute -top-1 -right-1 bg-black text-white w-4 h-4 rounded-full text-[8px] flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onCompare}
          disabled={items.length < 2}
          className="bg-drxred text-white px-6 py-3 text-[10px] uppercase tracking-widest font-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:text-black transition-all btn-drx"
        >
          {lang === 'ar' ? 'قارن' : 'Compare'}
        </button>
      </div>
    </div>
  );
};

export default ComparisonBar;
