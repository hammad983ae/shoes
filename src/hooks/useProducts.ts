import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  title: string;
  description: string;
  brand: string;
  category: string;
  limited: boolean;
  infinite_stock?: boolean;
  size_type: string;
  price: number;
  stock: number;
  filters: any;
  materials: string;
  care_instructions: string;
  shipping_time: string;
  availability: string;
  created_at: string;
  updated_at: string;
  media: Array<{
    id: string;
    url: string;
    role: string;
  }>;
}

interface ProductSummary {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export const useProducts = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<ProductSummary>({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const { data: productsData, error } = await supabase
        .from('products')
        .select(`
          *,
          product_media(id, url, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts = (productsData || []).map(product => ({
        ...product,
        description: product.description || '',
        materials: product.materials || '',
        care_instructions: product.care_instructions || '',
        shipping_time: product.shipping_time || '5-9 days',
        availability: product.availability || 'In Stock',
        stock: product.stock || 0,
        limited: product.limited || false,
        infinite_stock: product.infinite_stock || false,
        size_type: product.size_type || 'US',
        created_at: product.created_at || '',
        updated_at: product.updated_at || '',
        media: (product.product_media || []).map(media => ({
          ...media,
          role: media.role || 'gallery'
        }))
      }));

      setProducts(formattedProducts);

      // Calculate summary
      const totalProducts = formattedProducts.length;
      const inStock = formattedProducts.filter(p => p.stock > 10).length;
      const lowStock = formattedProducts.filter(p => p.stock > 0 && p.stock <= 10).length;
      const outOfStock = formattedProducts.filter(p => p.stock === 0).length;
      const totalValue = formattedProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);

      setSummary({
        totalProducts,
        inStock,
        lowStock,
        outOfStock,
        totalValue
      });

    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'media'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;

      await fetchProducts(); // Refresh the list
      return { success: true, data };
    } catch (error) {
      console.error('Error adding product:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    loading,
    products,
    summary,
    addProduct,
    refetch: fetchProducts
  };
};