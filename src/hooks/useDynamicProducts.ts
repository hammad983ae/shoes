import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sneaker } from '@/types/global';

export const useDynamicProducts = () => {
  const [products, setProducts] = useState<Sneaker[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products...');
      
      // Query with product_media join to get real photos
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_media(id, url, role, display_order)
        `)
        .order('created_at', { ascending: false });

      console.log('Products query result:', { data, error });
      if (error) {
        console.error('Products query error:', error);
        throw error;
      }

      console.log('Formatting products, data length:', data?.length);
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
          id: product.id, // Keep UUID for internal operations
          slug: product.slug || undefined, // Convert null to undefined for TypeScript compatibility
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
          keywords: [] // Could be extracted from filters
        };
      });

      console.log('Final formatted products:', formattedProducts);
      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]); // Set empty array on error
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