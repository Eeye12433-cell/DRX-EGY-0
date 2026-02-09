import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { Star, ArrowLeft, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/contexts/CurrencyContext';
import gsap from 'gsap';

const ProductDetailView = () => {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const product = products.find((p) => p.id === id);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>();
  const [selectedFlavor, setSelectedFlavor] = useState<string>();
  const { t, i18n } = useTranslation();
  const { formatPrice } = useCurrency();
  const currentLang = i18n.language as 'ar' | 'en';

  useEffect(() => {
    window.scrollTo(0, 0);
    gsap.fromTo(
      '.detail-anim',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
    );
  }, [id]);

  if (loading) {
    return (
      <div className="container py-32 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-drxred border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground animate-pulse">Loading Product Data...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-oswald font-bold mb-4 uppercase">Product Not Found</h1>
        <Link to="/shop">
          <Button variant="outline" className="font-mono uppercase tracking-widest">Return to Shop</Button>
        </Link>
      </div>
    );
  }

  const name = currentLang === 'ar' ? product.name_ar : product.name_en;
  const description = currentLang === 'ar' ? product.description_ar : product.description_en;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedFlavor);
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
      {/* Back */}
      <div className="detail-anim mb-8">
        <Link
          to="/shop"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground font-mono uppercase tracking-widest"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('product.backToShop', { defaultValue: 'Back to Shop' })}
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        {/* Product Image */}
        <div className="detail-anim aspect-square bg-black border border-white/5 overflow-hidden">
          <img
            src={product.image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="detail-anim space-y-6">
          <div className="text-[10px] font-mono text-drxred uppercase tracking-[0.2em] font-bold">
            {product.category}
          </div>
          <h1 className="text-5xl font-oswald font-black uppercase leading-[0.9] tracking-tighter">
            {name}
          </h1>

          {/* Rating */}
          <div className="flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < Math.floor(product.rating)
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground'
                    }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm font-mono">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-4">
            <span className="text-5xl font-oswald text-foreground font-bold">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Description */}
          <div className="p-6 bg-bg-card border border-white/10">
            <div className="relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-drxred/60"></div>
              <p className="pl-6 text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] font-bold mb-2">
                Size
              </label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="bg-background border-white/10">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Flavor Selection */}
          {product.flavors && product.flavors.length > 0 && (
            <div>
              <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] font-bold mb-2">
                Flavor
              </label>
              <Select value={selectedFlavor} onValueChange={setSelectedFlavor}>
                <SelectTrigger className="bg-background border-white/10">
                  <SelectValue placeholder="Select flavor" />
                </SelectTrigger>
                <SelectContent>
                  {product.flavors.map((flavor) => (
                    <SelectItem key={flavor} value={flavor}>
                      {flavor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] font-bold mb-2">
              Quantity
            </label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="border-white/10"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="w-12 text-center font-mono">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="border-white/10"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleAddToCart}
              size="lg"
              className="flex-1 bg-white text-black hover:bg-drxred hover:text-white font-mono text-xs uppercase tracking-[0.2em]"
            >
              {t('product.addToCart', { defaultValue: 'Add to cart' })}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;
