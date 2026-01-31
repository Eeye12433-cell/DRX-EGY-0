
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Product, Category, CartItem } from '../types';
import { GOALS } from '../constants';
import { generateProductImage, getAIRecommendations } from '../services/aiService';

interface ShopProps {
  lang: 'ar' | 'en';
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addToCart: (p: Product) => void;
  onCompare: (p: Product) => void;
  compareList: Product[];
  cart: CartItem[];
  viewHistoryNames: string[];
  purchaseHistoryNames: string[];
}

const Shop: React.FC<ShopProps> = ({ 
  lang, products, setProducts, addToCart, onCompare, compareList, cart, viewHistoryNames, purchaseHistoryNames 
}) => {
  const navigate = useNavigate();
  const { mode = 'all' } = useParams<{ mode?: string }>();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'selection'>(
    mode === 'goals' || mode === 'categories' ? 'selection' : 'grid'
  );

  useEffect(() => {
    if (mode === 'goals' || mode === 'categories') setViewMode('selection');
    else setViewMode('grid');
  }, [mode]);

  // Fetch AI Recommendations based on cart and user history
  useEffect(() => {
    const fetchRecs = async () => {
      setLoadingRecs(true);
      try {
        const recIds = await getAIRecommendations(cart, products, viewHistoryNames, purchaseHistoryNames);
        const recProducts = products.filter(p => recIds.includes(p.id));
        setRecommendations(recProducts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRecs(false);
      }
    };
    
    // Throttle recommendation updates
    const timeoutId = setTimeout(fetchRecs, 1500);
    return () => clearTimeout(timeoutId);
  }, [cart, products, viewHistoryNames, purchaseHistoryNames]);

  const categories = ['All', ...Object.values(Category)];

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (mode === 'new') list = list.filter(p => p.isNew);
    if (mode === 'best') list = list.filter(p => p.isBestSeller);
    if (activeCategory !== 'All') list = list.filter(p => p.category === activeCategory);
    if (selectedGoals.length > 0) list = list.filter(p => selectedGoals.some(g => p.goals?.includes(g)));
    if (inStockOnly) list = list.filter(p => p.inStock);
    return list;
  }, [products, mode, activeCategory, selectedGoals, inStockOnly]);

  const handleSynthesizeImage = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setGeneratingIds(prev => new Set(prev).add(product.id));
    try {
      const imageData = await generateProductImage(product.name_en, product.description_en);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, image: imageData } : p));
    } catch (err) {
      alert("AI SYNTHESIS ERROR");
    } finally {
      setGeneratingIds(prev => { const n = new Set(prev); n.delete(product.id); return n; });
    }
  };

  if (viewMode === 'selection') {
    return (
      <div className="py-10 animate-in fade-in duration-500">
        <h2 className="text-7xl font-black font-oswald uppercase mb-16 tracking-tighter drop-shadow-sm">
          {mode === 'goals' ? (lang === 'ar' ? 'تسوق حسب الهدف' : 'Shop by Goal') : (lang === 'ar' ? 'تسوق حسب الفئة' : 'Shop by Category')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(mode === 'goals' ? GOALS : Object.values(Category)).map(item => {
            const id = typeof item === 'string' ? item : item.id;
            const label = typeof item === 'string' ? item : (lang === 'ar' ? item.label_ar : item.label_en);
            return (
              <button 
                key={id}
                onClick={() => { if (mode === 'goals') setSelectedGoals([id]); else setActiveCategory(id); setViewMode('grid'); }}
                className="p-16 border border-white/5 bg-bg-card hover:border-drxred transition-all group text-center relative overflow-hidden shadow-xl"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-drxred -translate-x-full group-hover:translate-x-0 transition-transform"></div>
                <h3 className="text-3xl font-oswald font-black uppercase text-white tracking-tight">{label}</h3>
                <p className="text-xs font-mono text-zinc-500 uppercase mt-4 tracking-[0.2em] font-bold">Select Genetic Path</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 space-y-12 pb-32">
      <div className="space-y-10">
        <h2 className="text-8xl font-black font-oswald uppercase leading-none tracking-tighter drop-shadow-md">{lang === 'ar' ? 'المتجر الرئيسي' : 'Matrix Catalog'}</h2>
        <div className="bg-bg-card border border-white/10 p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-drxred"></div>
          <div className="flex flex-col lg:flex-row justify-between gap-12">
            <div className="space-y-6">
              <label className="text-xs font-mono text-zinc-600 uppercase tracking-[0.3em] font-black">Registry Filter</label>
              <div className="flex flex-wrap gap-3">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-8 py-3.5 font-mono text-xs uppercase border font-bold transition-all ${activeCategory === cat ? 'bg-drxred border-drxred text-white shadow-lg' : 'border-white/10 text-zinc-500 hover:border-white/30'}`}>{cat}</button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-6">
              <button onClick={() => setInStockOnly(!inStockOnly)} className={`px-8 py-3.5 font-mono text-xs uppercase border font-black transition-all flex items-center gap-4 h-[56px] ${inStockOnly ? 'border-green-500 text-green-500' : 'border-white/10 text-zinc-500'}`}>{lang === 'ar' ? 'المخزون المتوفر' : 'Live Inventory'}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {filteredProducts.map(p => {
          const isGenerating = generatingIds.has(p.id);
          const isCompared = compareList.find(c => c.id === p.id);
          return (
            <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} className="bg-bg-card border border-white/5 p-6 hover:border-drxred/40 transition-all group flex flex-col relative cursor-pointer shadow-lg hover:shadow-drxred/5">
              <div className="aspect-square mb-8 overflow-hidden relative bg-black">
                <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name_en} />
                <button 
                  onClick={(e) => { e.stopPropagation(); onCompare(p); }}
                  className={`absolute top-5 left-5 z-20 w-10 h-10 flex items-center justify-center rounded-full transition-all border-2 ${isCompared ? 'bg-drxred border-drxred text-white' : 'bg-black/60 border-white/20 text-white hover:bg-white hover:text-black'}`}
                  title="Add to Comparison"
                >
                  <span className="text-xl font-black">{isCompared ? '✓' : '+'}</span>
                </button>
                {isGenerating && <div className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center"><div className="w-10 h-10 border-4 border-drxred border-t-transparent rounded-full animate-spin"></div></div>}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                   <span className="text-[11px] font-mono text-drxred uppercase tracking-[0.2em] font-black">{p.category}</span>
                   <h3 className="font-black text-2xl font-oswald uppercase leading-tight mt-3 group-hover:text-drxred transition-colors tracking-tight">{lang === 'ar' ? p.name_ar : p.name_en}</h3>
                </div>
                <div className="flex justify-between items-end mt-12">
                   <div className="flex flex-col">
                      <span className="text-4xl font-oswald text-white font-black">{p.price.toLocaleString()}</span>
                      <span className="text-xs font-mono font-bold text-zinc-600 uppercase tracking-widest">LE / UNIT</span>
                   </div>
                   <button onClick={(e) => { e.stopPropagation(); addToCart(p); }} className="bg-white text-black px-8 py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-drxred hover:text-white transition-all shadow-xl">Deploy</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI RECOMMENDATIONS SECTION */}
      {recommendations.length > 0 && (
        <div className="pt-24 border-t border-white/5 space-y-12 animate-in fade-in duration-1000">
           <div className="flex items-center gap-8">
              <div className="w-16 h-16 bg-drxred/10 border-2 border-drxred/30 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.1)]">
                 <span className="text-2xl">✨</span>
              </div>
              <div>
                <h3 className="text-4xl font-black font-oswald uppercase tracking-tight">{lang === 'ar' ? 'توصيات ذكية مخصصة' : 'Neural Optimized Recommendations'}</h3>
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-[0.3em] font-bold">Personalized stack suggestions via Lovable AI (Context Aware)</p>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {recommendations.map(p => (
                <div key={`rec-${p.id}`} onClick={() => navigate(`/product/${p.id}`)} className="bg-drxred/5 border border-drxred/10 p-6 hover:border-drxred/40 transition-all group flex flex-col relative cursor-pointer shadow-lg">
                  <div className="aspect-square mb-8 overflow-hidden relative bg-black">
                    <img src={p.image} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all" alt={p.name_en} />
                    <div className="absolute top-0 right-0 p-3">
                       <span className="bg-drxred text-white text-[10px] font-mono px-3 py-1 uppercase font-black tracking-widest shadow-lg">AI Match</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                       <h3 className="font-black text-xl font-oswald uppercase leading-tight group-hover:text-drxred transition-colors">{lang === 'ar' ? p.name_ar : p.name_en}</h3>
                    </div>
                    <div className="flex justify-between items-end mt-6">
                       <span className="text-3xl font-oswald text-white font-black">{p.price.toLocaleString()} <span className="text-sm font-mono">LE</span></span>
                       <button onClick={(e) => { e.stopPropagation(); addToCart(p); }} className="bg-drxred text-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-lg">Add</button>
                    </div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
