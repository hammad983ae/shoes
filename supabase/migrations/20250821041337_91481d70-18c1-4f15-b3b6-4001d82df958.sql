-- Comprehensive RLS Fix Migration
-- 1. STORAGE BUCKETS SETUP

-- Create user-posts bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-posts', 'user-posts', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure avatars bucket is public
UPDATE storage.buckets SET public = true WHERE id = 'avatars';

-- 2. CLEAN UP EXISTING STORAGE POLICIES
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "User posts are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own posts" ON storage.objects;

-- 3. CREATE COMPREHENSIVE STORAGE POLICIES

-- Public read access for both buckets
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Public read access for user-posts"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-posts');

-- User-specific write access for avatars
CREATE POLICY "Users can manage their own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- User-specific write access for user-posts
CREATE POLICY "Users can manage their own posts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-posts' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own posts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-posts' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own posts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-posts' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. HELPER FUNCTIONS (is_admin already exists, add is_self)
CREATE OR REPLACE FUNCTION public.is_self(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = user_uuid;
$$;

-- 5. CLEAN UP AND FIX TABLE POLICIES

-- PROFILES TABLE
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_service_only" ON public.profiles;

CREATE POLICY "Users can read their own profile or admins can read all"
ON public.profiles FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can update their own profile or admins can update all"
ON public.profiles FOR UPDATE
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Only service role can insert profiles"
ON public.profiles FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- ORDERS TABLE
DROP POLICY IF EXISTS "orders_select_own_or_admin" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_self" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_update" ON public.orders;

CREATE POLICY "Users can read their own orders or admins can read all"
ON public.orders FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Only admins can update orders"
ON public.orders FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- ORDER ITEMS TABLE
DROP POLICY IF EXISTS "order_items_select_own_or_admin" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_own" ON public.order_items;

CREATE POLICY "Users can read their own order items or admins can read all"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_items.order_id 
    AND (o.user_id = auth.uid() OR is_admin())
  )
);

CREATE POLICY "Users can create their own order items"
ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_items.order_id 
    AND o.user_id = auth.uid()
  )
);

-- PRODUCTS TABLE (already has correct policies)
-- No changes needed - public read, admin write is already set

-- CREDITS/BALANCES TABLES
DROP POLICY IF EXISTS "select_own_or_admin" ON public.user_balances;
DROP POLICY IF EXISTS "credits_ledger_select_own_or_admin" ON public.credits_ledger;

CREATE POLICY "Users can read their own balance or admins can read all"
ON public.user_balances FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can read their own credit history or admins can read all"
ON public.credits_ledger FOR SELECT
USING (user_id = auth.uid() OR is_admin());

-- FAVORITES TABLE (already has correct policies)
-- REVIEWS TABLE (already has correct policies)

-- 6. ENABLE RLS ON ALL TABLES (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;

-- 7. ENABLE POLICY LOGGING FOR DEBUGGING
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_messages = 'info';
ALTER SYSTEM SET log_row_security = on;

-- Reload configuration
SELECT pg_reload_conf();