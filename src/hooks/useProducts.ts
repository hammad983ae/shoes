import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Media = {
  id: string;
  url: string;
  role: string; // mapped from 'kind' if 'role' isn't present in DB
};

interface Product {
  id: string;
  slug: string;
  name: string;
  title: string | null;
  description: string;
  brand: string | null;
  category: string | null;
  limited: boolean;
  infinite_stock?: boolean;
  size_type: string | null;
  price: number;              // numeric dollars (fallback to price_cents/100 if needed)
  price_cents?: number | null;
  stock: number;
  filters: any;
  materials: string;
  care_instructions: string;
  shipping_time: string;
  availability: string;
  created_at: string;
  updated_at: string;
  product_media?: Media[];
  media: Media[];
}

interface ProductSummary {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export const useProducts = (limit: number = 24, onlyActive: boolean = true) => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<ProductSummary>({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // NOTE: We alias role from 'kind' to be compatible with schemas that don't have 'role'
      let query = supabase
        .from('products')
        .select(`
          id, slug, name, title, description, brand, category,
          limited, infinite_stock, size_type,
          price, price_cents, stock, filters, materials, care_instructions,
          shipping_time, availability, created_at, updated_at,
          product_media:id (
            id,
            url,
            role:kind   -- alias ensures we always get a 'role' field even if column 'role' doesn't exist
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (onlyActive) {
        query = query.eq('active', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formatted: Product[] = (data || []).map((p: any) => {
        // normalize price: prefer numeric price, fallback to price_cents
        let price = Number(p?.price ?? 0);
        if (!price && typeof p?.price_cents === 'number') {
          price = Math.round((p.price_cents as number) / 100);
        }

        const media: Media[] = Array.isArray(p?.product_media)
          ? p.product_media.map((m: any) => ({
              id: m?.id,
              url: m?.url,
              role: m?.role || 'gallery',
            }))
          : [];

        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          title: p.title ?? p.name ?? null,
          description: p.description || '',
          brand: p.brand ?? null,
          category: p.category ?? null,
          limited: !!p.limited,
          infinite_stock: !!p.infinite_stock,
          size_type: p.size_type ?? 'US',
          price,
          price_cents: p.price_cents ?? null,
          stock: Number(p.stock ?? 0),
          filters: p.filters ?? {},
          materials: p.materials || '',
          care_instructions: p.care_instructions || '',
          shipping_time: p.shipping_time || '5-9 days',
          availability: p.availability || 'In Stock',
          created_at: p.created_at || '',
          updated_at: p.updated_at || '',
          product_media: media,
          media,
        };
      });

      setProducts(formatted);

      // summary
      const totalProducts = formatted.length;
      const inStock = formatted.filter(p => p.stock > 10).length;
      const lowStock = formatted.filter(p => p.stock > 0 && p.stock <= 10).length;
      const outOfStock = formatted.filter(p => p.stock === 0).length;
      const totalValue = formatted.reduce((sum, p) => sum + (Number(p.price) * Number(p.stock)), 0);

      setSummary({ totalProducts, inStock, lowStock, outOfStock, totalValue });
    } catch (e) {
      console.warn('Error fetching products:', e);
      // fail-soft: keep previous list instead of wiping to avoid permanent skeletons
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'product_media' | 'media' | 'price_cents'>
  ) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData as any])
        .select()
        .single();

      if (error) throw error;
      await fetchProducts();
      return { success: true, data };
    } catch (e) {
      console.error('Error adding product:', e);
      return { success: false, error: e };
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, onlyActive]);

  return {
    loading,
    products,
    summary,
    addProduct,
    refetch: fetchProducts,
  };
};
