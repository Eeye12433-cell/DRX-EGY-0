
import React from 'react';
import { Product } from '../types';

interface ComparisonMatrixProps {
  products: Product[];
  onClose: () => void;
  lang: 'ar' | 'en';
}

const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({ products, onClose, lang }) => {
  const specs = [
    { key: 'category', label_en: 'Operational Sector', label_ar: 'قطاع التشغيل' },
    { key: 'price', label_en: 'Valuation', label_ar: 'التقييم' },
    { key: 'inStock', label_en: 'Stock Integrity', label_ar: 'سلامة المخزون' },
    { key: 'isNew', label_en: 'Deployment Status', label_ar: 'حالة الانتشار' },
    { key: 'description_en', label_en: 'Tech Spec', label_ar: 'المواصفات الفنية' }
  ];

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-bg-card border border-white/10 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/40">
          <h2 className="text-4xl font-black font-oswald uppercase tracking-tighter">Unit <span className="text-drxred">Comparison Matrix</span></h2>
          <button onClick={onClose} className="text-muted hover:text-white font-mono text-xs uppercase">[ Clear Matrix ]</button>
        </div>

        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
          <table className="w-full text-left font-mono text-[11px] uppercase tracking-tight border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="py-8 w-1/4"></th>
                {products.map(p => (
                  <th key={p.id} className="py-8 px-6 text-center">
                    <div className="space-y-4">
                      <img src={p.image} className="w-24 h-24 mx-auto object-contain bg-black border border-white/10" alt="" />
                      <div className="text-sm font-bold font-oswald text-white tracking-widest">
                        {lang === 'ar' ? p.name_ar : p.name_en}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specs.map(spec => (
                <tr key={spec.key} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-6 font-bold text-drxred tracking-mega">
                    {lang === 'ar' ? spec.label_ar : spec.label_en}
                  </td>
                  {products.map(p => (
                    <td key={p.id} className="py-6 px-6 text-center text-zinc-400">
                      {spec.key === 'price' ? `${p.price.toLocaleString()} LE` : 
                       spec.key === 'inStock' ? (p.inStock ? 'ACTIVE' : 'VOID') :
                       spec.key === 'isNew' ? (p.isNew ? 'NEW' : 'STABLE') :
                       spec.key === 'description_en' ? (lang === 'ar' ? p.description_ar : p.description_en) :
                       (p as any)[spec.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparisonMatrix;
