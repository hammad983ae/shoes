import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sneaker } from '@/types/global';

export const useDynamicProducts = () => {
  const [products, setProducts] = useState<Sneaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchProducts = async () => {
    if (hasLoaded) return; // Prevent duplicate fetches
    
    try {
      setLoading(true);
      
      // Query with product_media join to get real photos
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_media(id, url, role, display_order)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Products query error:', error);
        throw error;
      }

      const formattedProducts: Sneaker[] = (data || []).map(product => {
        // Sort all media by display_order to maintain consistent ordering
        const sortedMedia = (product.product_media || [])
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
        
        // Find primary image first, fallback to first image in order
        const primaryImage = sortedMedia.find((media: any) => media.role === 'primary')?.url || 
                           sortedMedia[0]?.url || '';
        
        // Get all gallery images in order
        const galleryImages = sortedMedia
          .filter((media: any) => media.role === 'gallery')
          .map((media: any) => media.url);

        // Combine all images: primary first, then gallery images in display order
        const allImages = primaryImage ? [primaryImage, ...galleryImages] : galleryImages;

        return {
          id: product.id,
          slug: product.slug || undefined,
          name: product.title,
          price: `$${product.price}`,
          slashed_price: product.slashed_price || undefined,
          image: primaryImage,
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
          is_limited: product.is_limited || false,
          infinite_stock: product.infinite_stock || false,
          type: product.category?.toLowerCase().includes('high') ? 'high-top' : 'low-top',
          colors: product.color ? product.color.split(',').map(c => c.trim()).filter(Boolean) : [],
          keywords: []
        };
      });

      setProducts(formattedProducts);
      setHasLoaded(true);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
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
    refetch: () => {
      setHasLoaded(false);
      fetchProducts();
    }
  };
};