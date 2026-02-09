import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';
  const name = currentLang === 'ar' ? product.name_ar : product.name_en;
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group overflow-hidden border-white/5 bg-bg-card hover:border-drxred/40 hover:shadow-lg hover:shadow-drxred/5 transition-all">
        <div className="relative aspect-square overflow-hidden bg-black">
          <img
            src={product.image}
            alt={name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-oswald font-bold uppercase tracking-widest">
                {t('productCard.outOfStock')}
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="text-[10px] font-mono text-drxred uppercase tracking-[0.2em] font-bold mb-1">
            {product.category}
          </div>
          <h3 className="font-oswald font-bold text-sm mb-2 line-clamp-2 uppercase leading-tight">
            {name}
          </h3>
          <div className="flex items-center mb-2">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm ml-1 font-mono">{product.rating}</span>
            <span className="text-xs text-muted-foreground ml-1 font-mono">({product.reviews})</span>
          </div>
          <div className="text-2xl font-oswald font-bold text-foreground">
            {formatPrice(product.price)}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full bg-white text-black hover:bg-drxred hover:text-white font-mono text-xs uppercase tracking-widest"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {t('product.addToCart')}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;
