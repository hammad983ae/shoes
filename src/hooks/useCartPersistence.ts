import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';

export const useCartPersistence = () => {
  const { items, addItem, clearCart } = useCart();

  // Save cart to database whenever items change
  useEffect(() => {
    const saveCartToDatabase = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (items.length === 0) {
          // Clear cart in database if empty
          await supabase
            .from('cart')
            .delete()
            .eq('user_id', user.id);
          return;
        }

        // Upsert cart data
        await supabase
          .from('cart')
          .upsert({
            user_id: user.id,
            items: JSON.stringify(items),
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'user_id' 
          });
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };

    // Debounce the save operation
    const timeoutId = setTimeout(saveCartToDatabase, 1000);
    return () => clearTimeout(timeoutId);
  }, [items]);

  // Load cart from database on user login
  const loadCartFromDatabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: cartData, error } = await supabase
        .from('cart')
        .select('items')
        .eq('user_id', user.id)
        .single();

      if (error || !cartData?.items) return;

      // Clear current cart and add items from database
      clearCart();
      const cartItems = typeof cartData.items === 'string' 
        ? JSON.parse(cartData.items) 
        : cartData.items;
      
      if (Array.isArray(cartItems)) {
        cartItems.forEach((item: any) => {
          addItem(item);
        });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  // Listen for auth state changes to load cart
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          loadCartFromDatabase();
        } else if (event === 'SIGNED_OUT') {
          clearCart();
        }
      }
    );

    // Load cart on initial load if user is already logged in
    loadCartFromDatabase();

    return () => subscription.unsubscribe();
  }, []);

  return {
    loadCartFromDatabase,
    // Expose function to manually sync cart
    syncCart: () => {
      const timeoutId = setTimeout(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && items.length > 0) {
          await supabase
            .from('cart')
            .upsert({
              user_id: user.id,
              items: JSON.stringify(items),
              updated_at: new Date().toISOString()
            }, { 
              onConflict: 'user_id' 
            });
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  };
};