import { useEffect, useRef } from 'react';
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
  const loadedRef = useRef(false);
  const savingRef = useRef<number | null>(null);

  // load once on mount & when user signs in
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setIsLoaded?.(true); return; }
        const { data, error } = await supabase
          .from('cart')
          .select('items')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error && error.code !== 'PGRST116') { // not found is fine
          console.error('load cart error', error);
          setIsLoaded?.(true);
          return;
        }
        if (!mounted) return;
        if (data?.items && Array.isArray(data.items)) {
          setItems(data.items as CartItem[]);
        } else {
          setItems([]);
        }
        loadedRef.current = true;
        setIsLoaded?.(true);
      } catch (e) {
        console.error('load cart exception', e);
        setIsLoaded?.(true);
      }
    };

    void load();

    const { data: sub } = supabase.auth.onAuthStateChange(async (evt, sess) => {
      if (evt === 'SIGNED_IN' && sess?.user) {
        loadedRef.current = false;
        await load();
      }
      if (evt === 'SIGNED_OUT') {
        setItems([]);
        loadedRef.current = true;
        setIsLoaded?.(true);
      }
    });

    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [setItems, setIsLoaded]);

  // save with debounce (only when authed and after initial load)
  useEffect(() => {
    const save = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !loadedRef.current) return;
      try {
        await supabase
          .from('cart')
          .upsert({
            user_id: user.id,
            items: items as any,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      } catch (e) {
        console.error('save cart exception', e);
      }
    };

    if (savingRef.current) clearTimeout(savingRef.current);
    savingRef.current = window.setTimeout(save, 250);

    return () => { if (savingRef.current) clearTimeout(savingRef.current); };
  }, [items]);

  const clearCartFromSupabase = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    try {
      await supabase.from('cart').delete().eq('user_id', user.id);
    } catch (e) {
      console.error('clear cart exception', e);
    }
  };

  return { clearCartFromSupabase };
};
