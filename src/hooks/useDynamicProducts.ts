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
          product_media(id, url, role, display_order)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts: Sneaker[] = (data || []).map(product => {
        // Sort all media by display_order to maintain consistent ordering
        const sortedMedia = (product.product_media || [])
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        
        // Find primary image first, fallback to first image in order
        const primaryImage = sortedMedia.find(media => media.role === 'primary')?.url || 
                           sortedMedia[0]?.url || '';
        
        // Get all gallery images in order
        const galleryImages = sortedMedia
          .filter(media => media.role === 'gallery')
          .map(media => media.url);

        // Combine all images: primary first, then gallery images in display order
        const allImages = primaryImage ? [primaryImage, ...galleryImages] : galleryImages;

        return {
          id: product.id, // Keep as UUID string, don't convert to int
          name: product.title,
          price: `$${product.price}`,
          slashed_price: product.slashed_price || undefined,
          image: primaryImage || galleryImages[0] || '',
          images: allImages,
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