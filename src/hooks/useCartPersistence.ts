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

        // Prepare items for database storage - ensure all fields are properly formatted
        const itemsForDb = items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          size: item.size,
          quantity: item.quantity,
          size_type: item.size_type
        }));

        // Upsert cart data
        await supabase
          .from('cart')
          .upsert({
            user_id: user.id,
            items: JSON.stringify(itemsForDb),
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'user_id' 
          });
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };

    // Only save if user is authenticated and items exist
    const timeoutId = setTimeout(saveCartToDatabase, 500);
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

      // Parse cart items
      const cartItems = typeof cartData.items === 'string' 
        ? JSON.parse(cartData.items) 
        : cartData.items;
      
      if (Array.isArray(cartItems) && cartItems.length > 0) {
        // Clear current cart first
        clearCart();
        
        // Add each item from database to cart
        cartItems.forEach((item: any) => {
          // Ensure the item has all required fields
          if (item.id && item.name && item.price && item.size) {
            addItem({
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image || '',
              size: item.size,
              size_type: item.size_type || 'US'
            });
            
            // Add additional quantities if needed
            if (item.quantity > 1) {
              for (let i = 1; i < item.quantity; i++) {
                addItem({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  image: item.image || '',
                  size: item.size,
                  size_type: item.size_type || 'US'
                });
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  // Listen for auth state changes to load cart
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer loading cart to avoid auth state callback issues
          setTimeout(() => {
            loadCartFromDatabase();
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          clearCart();
        }
      }
    );

    // Load cart on initial load if user is already logged in
    const checkInitialAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        loadCartFromDatabase();
      }
    };
    
    checkInitialAuth();

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