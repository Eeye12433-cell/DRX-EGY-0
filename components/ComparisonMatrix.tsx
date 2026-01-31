import React from 'react';
import { Product } from '../types';

interface ComparisonMatrixProps {
  products: Product[];
  onClose: () => void;
  lang: 'ar' | 'en';
}

const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({ products, onClose, lang }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[900] bg-black/90 backdrop-blur-md p-4 sm:p-10 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto bg-bg-card border border-white/10 shadow-2xl p-8 sm:p-12 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
        >
          [ {lang === 'ar' ? 'إغلاق' : 'Close'} ]
        </button>

        <h2 className="text-4xl font-oswald uppercase tracking-tight mb-10">
          {lang === 'ar' ? 'مصفوفة' : 'Comparison'} <span className="text-drxred">{lang === 'ar' ? 'المقارنة' : 'Matrix'}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <div key={p.id} className="border border-white/10 bg-black/30 p-6">
              <div className="aspect-square flex items-center justify-center mb-4">
                <img
                  src={p.imageUrl || p.image}
                  className="w-24 h-24 mx-auto object-contain bg-black border border-white/10"
                  alt=""
                  onError={(e) => { const img = e.currentTarget as HTMLImageElement; if (img.src !== p.image) img.src = p.image; } }
                />
              </div>

              <div className="font-oswald uppercase tracking-tight text-lg leading-tight mb-2">
                {lang === 'ar' ? p.name_ar : p.name_en}
              </div>

              <div className="text-drxred font-oswald text-2xl font-bold mb-4">
                {p.price.toLocaleString()} <span className="text-xs">LE</span>
              </div>

              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-relaxed">
                {lang === 'ar' ? p.description_ar : p.description_en}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparisonMatrix;
