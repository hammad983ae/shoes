import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sneaker } from '@/types/global';

export const useDynamicProducts = () => {
  const [products, setProducts] = useState<Sneaker[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_media(id, url, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts: Sneaker[] = (data || []).map(product => {
        const images = (product.product_media || [])
          .filter(media => media.role === 'gallery')
          .map(media => media.url);
        
        const primaryImage = (product.product_media || [])
          .find(media => media.role === 'primary')?.url || images[0] || '';

        return {
          id: parseInt(product.id),
          name: product.title,
          price: `$${product.price}`,
          image: primaryImage,
          images: images,
          brand: product.brand,
          category: product.category,
          description: product.description || '',
          sizing: product.size_type || undefined,
          availability: product.availability || undefined,
          shipping: product.shipping_time || undefined,
          materials: product.materials || '',
          care: product.care_instructions || '',
          inStock: (product.stock || 0) > 0,
          stock: (product.stock || 0).toString(),
          limited: product.limited,
          type: product.category?.toLowerCase().includes('high') ? 'high-top' : 'low-top',
          colors: [], // Could be extracted from filters
          keywords: [] // Could be extracted from filters
        };
      });

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    refetch: fetchProducts
  };
};