import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string;
  size: string | number;
  quantity: number;
  size_type: 'EU' | 'US';
}

export const useCartPersistence = (
  items: CartItem[],
  setItems: (items: CartItem[]) => void,
  setIsLoaded?: (loaded: boolean) => void
) => {

  // Load cart from Supabase when component mounts and when auth state changes
  useEffect(() => {
    const loadCart = async () => {
      await loadCartFromSupabase();
    };
    loadCart();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadCartFromSupabase();
      } else if (event === 'SIGNED_OUT') {
        setItems([]);
        setIsLoaded?.(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save cart to Supabase whenever items change (only after initial load)
  useEffect(() => {
    if (setIsLoaded) {
      // If we have the setIsLoaded function, wait for initial load before saving
      const timeoutId = setTimeout(() => {
        saveCartToSupabase();
      }, 100);
      return () => clearTimeout(timeoutId);
    } else {
      // Fallback for when setIsLoaded isn't provided
      saveCartToSupabase();
    }
  }, [items]);

  const loadCartFromSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoaded?.(true);
        return;
      }

      const { data, error } = await supabase
        .from('cart')
        .select('items')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading cart:', error);
        setIsLoaded?.(true);
        return;
      }

      if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
        console.log('Loading cart from Supabase:', data.items);
        setItems(data.items as unknown as CartItem[]);
      } else {
        console.log('No cart data found in Supabase or empty cart');
        setItems([]);
      }
      setIsLoaded?.(true);
    } catch (error) {
      console.error('Error loading cart from Supabase:', error);
      setIsLoaded?.(true);
    }
  };

  const saveCartToSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Saving cart to Supabase:', items);
      
      const { error } = await supabase
        .from('cart')
        .upsert({
          user_id: user.id,
          items: items as any,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving cart:', error);
      } else {
        console.log('Cart saved successfully to Supabase');
      }
    } catch (error) {
      console.error('Error saving cart to Supabase:', error);
    }
  };

  const clearCartFromSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing cart from Supabase:', error);
      } else {
        console.log('Cart cleared from Supabase');
      }
    } catch (error) {
      console.error('Error clearing cart from Supabase:', error);
    }
  };

  return {
    loadCartFromSupabase,
    saveCartToSupabase,
    clearCartFromSupabase
  };
};