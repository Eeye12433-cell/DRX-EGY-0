
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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[400] w-full max-w-2xl px-4 animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-bg-card border border-drxred/30 shadow-[0_20px_50px_rgba(225,29,72,0.2)] p-4 flex items-center justify-between rounded-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="bg-drxred text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
            {items.length}
          </div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-mega hidden sm:block">
            {lang === 'ar' ? 'وحدات في الانتظار' : 'Units in Comparison Registry'}
          </span>
        </div>

        <div className="flex gap-4">
          <div className="flex -space-x-2">
            {items.map(p => (
              <div key={p.id} className="relative group">
                <img 
                  src={p.image} 
                  className="w-10 h-10 rounded-full border-2 border-bg-card object-cover bg-black" 
                  alt="" 
                />
                <button 
                  onClick={() => onRemove(p.id)}
                  className="absolute -top-1 -right-1 bg-black text-white w-4 h-4 rounded-full text-[8px] flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          <button 
            disabled={items.length < 2}
            onClick={onCompare}
            className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm ${items.length >= 2 ? 'bg-white text-black hover:bg-drxred hover:text-white' : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'}`}
          >
            {lang === 'ar' ? 'مقارنة المصفوفة' : 'Compare Matrix'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonBar;
