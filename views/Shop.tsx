import { useState, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import { products, categories } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory && selectedCategory !== 'All Products') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim() !== '') {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="py-10 space-y-12 pb-32">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-8xl font-black font-oswald uppercase leading-none tracking-tighter drop-shadow-md">
          {t('shop.title', { defaultValue: 'Matrix Catalog' })}
        </h1>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em]">
          {t('shop.showing', { defaultValue: 'Showing' })}{' '}
          <span className="font-bold text-foreground">{filteredProducts.length}</span>{' '}
          {t('shop.of', { defaultValue: 'of' })}{' '}
          <span className="font-bold text-foreground">{products.length}</span>{' '}
          {t('shop.products', { defaultValue: 'products' })}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-bg-card border border-white/10 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-drxred"></div>

        <div className="flex flex-col lg:flex-row justify-between gap-8">
          {/* Search */}
          <div className="w-full lg:w-1/3">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] font-bold mb-2 block">
              Search
            </label>
            <Input
              type="text"
              placeholder={t('shop.searchPlaceholder') || 'Search products...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background border-white/10 font-mono text-sm"
            />
          </div>

          {/* Category Filters */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] font-bold block">
              Registry Filter
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className={`font-mono text-xs uppercase tracking-widest ${
                    selectedCategory === category
                      ? 'bg-drxred border-drxred text-white shadow-lg'
                      : 'border-white/10 text-muted-foreground hover:border-white/30'
                  }`}
                >
                  {t(category)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground font-mono">
            {t('shop.noProducts')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Shop;
