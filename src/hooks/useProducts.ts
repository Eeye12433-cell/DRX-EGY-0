import React, { useState, useEffect, useCallback } from 'react';
import { Product, Category } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { INITIAL_PRODUCTS } from '../../constants';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | null>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

// Map database row to Product type
const mapDbProductToProduct = (row: any): Product => ({
  id: row.id,
  name_ar: row.name_ar,
  name_en: row.name_en,
  description_ar: row.description_ar || '',
  description_en: row.description_en || '',
  price: Number(row.price),
  image: row.image || 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&h=600&fit=crop',
  category: row.category as Category,
  inStock: row.in_stock,
  isNew: row.is_new,
  isBestSeller: row.is_best_seller,
  featured: row.featured || 0,
  goals: row.goals || [],
});

// Map Product to database insert/update format
const mapProductToDb = (product: Partial<Product>) => ({
  name_ar: product.name_ar,
  name_en: product.name_en,
  description_ar: product.description_ar,
  description_en: product.description_en,
  price: product.price,
  image: product.image,
  category: product.category as "Protein" | "Performance" | "Pre-Workout" | "Recovery" | "Health & Wellness",
  in_stock: product.inStock,
  is_new: product.isNew,
  is_best_seller: product.isBestSeller,
  featured: product.featured,
  goals: product.goals,
  slug: `${product.name_en?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'product'}-${Date.now()}`,
});

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('featured', { ascending: true });

      if (fetchError) {
        console.error('Failed to fetch products from database:', fetchError);
        // Fallback to initial products if database fetch fails
        setProducts(INITIAL_PRODUCTS);
        setError('Using cached products - database unavailable');
      } else if (data && data.length > 0) {
        setProducts(data.map(mapDbProductToProduct));
      } else {
        // No products in database, use initial products
        setProducts(INITIAL_PRODUCTS);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts(INITIAL_PRODUCTS);
      setError('Using cached products');
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, 'id'>): Promise<Product | null> => {
    try {
      const dbProduct = mapProductToDb(product);
      const { data, error: insertError } = await supabase
        .from('products')
        .insert([dbProduct] as any)
        .select()
        .single();

      if (insertError) {
        console.error('Failed to add product:', insertError);
        return null;
      }

      const newProduct = mapDbProductToProduct(data);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      console.error('Error adding product:', err);
      return null;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>): Promise<boolean> => {
    try {
      const dbUpdates = mapProductToDb(updates);
      // Remove undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key as keyof typeof dbUpdates] === undefined) {
          delete dbUpdates[key as keyof typeof dbUpdates];
        }
      });

      const { error: updateError } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id);

      if (updateError) {
        console.error('Failed to update product:', updateError);
        return false;
      }

      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      return true;
    } catch (err) {
      console.error('Error updating product:', err);
      return false;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Failed to delete product:', deleteError);
        return false;
      }

      setProducts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    setProducts,
  };
}
