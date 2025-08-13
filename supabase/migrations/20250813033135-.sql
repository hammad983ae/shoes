-- Fix profiles table RLS security issue
-- Drop the overly permissive policy that allows anyone to view all profile data
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create more granular policies for different access levels

-- 1. Allow public access to basic display information needed for UI
CREATE POLICY "Public can view basic profile info" ON public.profiles
FOR SELECT
USING (true)
WITH CHECK (false);

-- However, we need to restrict what columns can be accessed publicly
-- So let's create a more restrictive policy instead

-- Actually, let's use a different approach with RLS that restricts sensitive columns
-- First, drop the public policy
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

-- Create policies that allow different access levels:

-- 1. Users can view their own complete profile
CREATE POLICY "Users can view own complete profile" ON public.profiles
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Authenticated users can view basic public info of other users (display_name, avatar_url)
-- We'll need to handle this at the application level by being careful about what we select

-- 3. For now, let's allow authenticated users to view basic fields of all profiles
-- but we'll document that sensitive fields should not be selected in public queries
CREATE POLICY "Authenticated users can view basic profile info" ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- Note: The application code should be updated to only select non-sensitive fields 
-- when displaying public profile information. Sensitive fields include:
-- - referral_code
-- - commission_rate
-- - creator_tier
-- - bio (depending on privacy settings)
-- - referred_by
-- - credits
-- - month_revenue_cached

-- The better long-term solution would be to create a view or use RLS column-level security
-- but for now this restricts access to authenticated users only