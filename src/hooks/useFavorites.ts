import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Favorite interface removed - not used

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const favoriteProductIds = data?.map(fav => fav.product_id) || [];
      setFavorites(favoriteProductIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      return;
    }

    const isFavorite = favorites.includes(productId);

    try {
      if (isFavorite) {
        // Remove favorite
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;

        setFavorites(prev => prev.filter(id => id !== productId));
        toast({
          title: "Removed from favorites",
          description: "Item has been removed from your favorites",
        });
      } else {
        // Add favorite
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            product_id: productId
          }]);

        if (error) throw error;

        setFavorites(prev => [...prev, productId]);
        toast({
          title: "Added to favorites",
          description: "Item has been added to your favorites",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  const getFavoriteProducts = async () => {
    if (!user || favorites.length === 0) return [];

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_media(id, url, role)
        `)
        .in('id', favorites);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching favorite products:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    getFavoriteProducts,
    refetch: fetchFavorites
  };
};