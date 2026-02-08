import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, Review } from '../types';
import StarRating from '../components/StarRating';
import gsap from 'gsap';

interface ProductDetailViewProps {
  lang: 'ar' | 'en';
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addToCart: (p: Product) => void;
}

type SupplyMode = 'single' | 'auto';

// Local extension to avoid unsafe casting (no need to change Product type right now)
type ProductWithSubscription = Product & {
  subscription?: number;
};

const ProductImage: React.FC<{ product: Product }> = ({ product }) => {
  const imageUrl = (product as any).imageUrl || product.image;

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    // fallback to base image if the URL fails
    if (product.image && img.src !== product.image) {
      img.src = product.image;
    }
  }, [product.image]);

  return (
    <div className="aspect-square bg-black border border-white/5 relative overflow-hidden group">
      <img
        src={imageUrl}
        className="w-full h-full object-contain"
        alt={product.name_en}
        onError={handleImageError}
      />
    </div>
  );
};

const ProductHeader: React.FC<{ lang: 'ar' | 'en'; product: Product }> = ({ lang, product }) => (
  <div className="space-y-4">
    <span className="text-[10px] font-mono text-drxred uppercase tracking-mega font-black border-b border-drxred/20 pb-1">
      Registry: {product.id.toUpperCase()}
    </span>

    <h1 className="text-5xl font-black font-oswald uppercase leading-[0.85] tracking-tighter text-justify lg:text-base">
      {lang === 'ar' ? product.name_ar : product.name_en}
    </h1>

    <div className="flex items-end gap-6 pt-4">
      <span className="text-5xl font-oswald text-white font-bold">
        {product.price.toLocaleString()} <span className="text-2xl font-oswald">LE</span>
      </span>
      <span className="text-xs font-mono text-zinc-600 uppercase mb-2">/ Matrix Unit</span>
    </div>
  </div>
);

const SupplyOptions: React.FC<{
  supplyMode: SupplyMode;
  setSupplyMode: React.Dispatch<React.SetStateAction<SupplyMode>>;
  frequency: number;
  setFrequency: React.Dispatch<React.SetStateAction<number>>;
}> = ({ supplyMode, setSupplyMode, frequency, setFrequency }) => (
  <div className="p-8 bg-bg-card border border-white/10 space-y-6">
    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-mega">Strategic Supply Options</h4>

    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => setSupplyMode('single')}
        className={`p-4 border font-mono text-[9px] uppercase transition-all ${
          supplyMode === 'single' ? 'bg-white text-black border-white' : 'bg-black border-white/10 text-zinc-500'
        }`}
      >
        Single Deployment
      </button>

      <button
        type="button"
        onClick={() => setSupplyMode('auto')}
        className={`p-4 border font-mono text-[9px] uppercase transition-all ${
          supplyMode === 'auto' ? 'bg-drxred border-drxred text-white' : 'bg-black border-white/10 text-zinc-500'
        }`}
      >
        Tactical Re-supply (Save 10%)
      </button>
    </div>

    {supplyMode === 'auto' && (
      <div className="space-y-3 pt-4 border-t border-white/5 animate-in slide-in-from-top-2">
        <label className="text-[9px] font-mono text-zinc-600 uppercase">Frequency Registry</label>
        <div className="flex gap-2">
          {[30, 60, 90].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFrequency(f)}
              className={`px-4 py-2 text-[10px] border transition-all ${
                frequency === f ? 'bg-white text-black' : 'border-white/10 text-zinc-500'
              }`}
            >
              Every {f} Days
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);

/** ✅ NEW: Product Description Section */
const ProductDescription: React.FC<{ lang: 'ar' | 'en'; product: Product }> = ({ lang, product }) => {
  // supports description_ar/description_en with fallback
  const desc =
    lang === 'ar'
      ? ((product as any).description_ar || (product as any).description_en || '')
      : ((product as any).description_en || (product as any).description_ar || '');

  if (!desc) {
    return (
      <div className="p-8 bg-bg-card border border-white/10 space-y-4">
        <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-mega">
          {lang === 'ar' ? 'الوصف التفصيلي' : 'Detailed Description'}
        </h4>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {lang === 'ar' ? 'لا يوجد وصف متاح حالياً.' : 'No description available yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-bg-card border border-white/10 space-y-4">
      <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-mega">
        {lang === 'ar' ? 'الوصف التفصيلي' : 'Detailed Description'}
      </h4>

      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-drxred/60"></div>
        <p className="pl-6 text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
          {desc}
        </p>
      </div>
    </div>
  );
};

const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  lang,
  products,
  setProducts,
  addToCart
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ✅ Strong typing + safety
  if (!id) return null;

  const [supplyMode, setSupplyMode] = useState<SupplyMode>('single');
  const [frequency, setFrequency] = useState<number>(30);

  const product = useMemo(() => products.find(p => p.id === id), [products, id]);

  // review states kept as-is (even if not used yet)
  const [reviewName, setReviewName] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    gsap.fromTo(
      '.detail-anim',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
    );
  }, [id]);

  if (!product) return null;

  // ✅ No "as Product" casting, and no need to modify Product type yet
  const handleDeploy = () => {
    const pWithSubscription: ProductWithSubscription = {
      ...product,
      subscription: supplyMode === 'auto' ? frequency : undefined
    };
    addToCart(pWithSubscription);
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
      {/* ✅ Back */}
      <div className="detail-anim mb-8 flex items-center justify-between gap-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-3 border border-white/10 text-zinc-300 hover:border-white/30 transition-all font-mono text-xs uppercase"
        >
          {lang === 'ar' ? 'رجوع' : 'Back'}
        </button>

        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-mega">
          {lang === 'ar' ? 'صفحة تفاصيل المنتج' : 'Product Detail View'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <div className="detail-anim">
          <ProductImage product={product} />
        </div>

        <div className="detail-anim space-y-12">
          <ProductHeader lang={lang} product={product} />

          {/* ✅ NEW: Show detailed description here */}
          <ProductDescription lang={lang} product={product} />

          <SupplyOptions
            supplyMode={supplyMode}
            setSupplyMode={setSupplyMode}
            frequency={frequency}
            setFrequency={setFrequency}
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={handleDeploy}
              className="btn-drx flex-1 bg-white text-black py-5 font-black uppercase tracking-[0.4em] text-xs hover:bg-drxred hover:text-white transition-all shadow-2xl"
            >
              Execute Deployment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;
