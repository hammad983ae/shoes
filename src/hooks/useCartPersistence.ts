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
  setItems: (items: CartItem[]) => void
) => {
  // Get current user from Supabase auth
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

  // Load cart from Supabase when user logs in
  useEffect(() => {
    loadCartFromSupabase();
  }, []);

  // Save cart to Supabase whenever items change (and user is logged in)
  useEffect(() => {
    if (items.length >= 0) {
      saveCartToSupabase();
    }
  }, [items]);

  const loadCartFromSupabase = async () => {
    const user = await getCurrentUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cart')
        .select('items')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading cart:', error);
        return;
      }

      if (data?.items && Array.isArray(data.items)) {
        setItems(data.items as unknown as CartItem[]);
      }
    } catch (error) {
      console.error('Error loading cart from Supabase:', error);
    }
  };

  const saveCartToSupabase = async () => {
    const user = await getCurrentUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart')
        .upsert({
          user_id: user.id,
          items: items as any, // Type assertion for jsonb field
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving cart:', error);
      }
    } catch (error) {
      console.error('Error saving cart to Supabase:', error);
    }
  };

  const clearCartFromSupabase = async () => {
    const user = await getCurrentUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing cart from Supabase:', error);
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