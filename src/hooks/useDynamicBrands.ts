import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDynamicBrands = () => {
  const [brands, setBrands] = useState<string[]>([
    'Nike', 'Rick Owens', 'Maison Margiela', 'Jordan', 'Adidas', 'Stone Island'
  ]);
  const [loading, setLoading] = useState(false);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('brand')
        .not('brand', 'is', null);

      if (error) throw error;

      // Extract unique brands and sort them
      const uniqueBrands = [...new Set(data?.map(product => product.brand) || [])];
      const sortedBrands = uniqueBrands.sort();
      
      setBrands(sortedBrands);
    } catch (error) {
      console.error('Error fetching brands:', error);
      // Keep default brands on error
    } finally {
      setLoading(false);
    }
  };

  const addBrand = (newBrand: string) => {
    if (!brands.includes(newBrand)) {
      const updatedBrands = [...brands, newBrand].sort();
      setBrands(updatedBrands);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return {
    brands,
    loading,
    addBrand,
    refetch: fetchBrands
  };
};
