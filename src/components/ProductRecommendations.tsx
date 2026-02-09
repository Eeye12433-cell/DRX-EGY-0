import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Star } from 'lucide-react';

interface ProductRecommendationsProps {
  products: Product[];
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ products }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  if (products.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-oswald font-bold mb-2 uppercase">
          {t('calculator.recommendations.title')}
        </h2>
        <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
          {t('calculator.recommendations.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden border-white/5 bg-bg-card hover:shadow-lg hover:shadow-drxred/5 transition-shadow">
            <div className="aspect-square relative overflow-hidden bg-black">
              <img
                src={product.image}
                alt={product.name}
                className="object-cover w-full h-full transition-transform hover:scale-105"
                loading="lazy"
              />
            </div>
            <CardHeader className="p-4">
              <div className="text-[10px] font-mono text-drxred uppercase tracking-[0.2em] font-bold mb-1">
                {product.category}
              </div>
              <CardTitle className="text-base font-oswald uppercase line-clamp-2">
                {product.name}
              </CardTitle>
              <div className="flex items-center gap-1 mt-2">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-sm font-mono font-medium">{product.rating}</span>
                <span className="text-xs text-muted-foreground font-mono">({product.reviews})</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-oswald font-bold">{formatPrice(product.price)}</span>
              </div>
              <Link to={`/product/${product.id}`}>
                <Button className="w-full bg-white text-black hover:bg-drxred hover:text-white font-mono text-xs uppercase tracking-widest" size="sm">
                  {t('calculator.recommendations.viewProduct')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default memo(ProductRecommendations);
