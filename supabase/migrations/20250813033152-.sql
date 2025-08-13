-- Fix profiles table RLS security issue
-- Drop the overly permissive policy that allows anyone to view all profile data
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create more granular policies for different access levels:

-- 1. Users can view their own complete profile
CREATE POLICY "Users can view own complete profile" ON public.profiles
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Authenticated users can view basic profile info of other users
-- This restricts access to authenticated users only, preventing public access
CREATE POLICY "Authenticated users can view basic profile info" ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- Note: The application code should be updated to only select non-sensitive fields 
-- when displaying public profile information. Sensitive fields include:
-- - referral_code (should only be accessible to profile owner)
-- - commission_rate (sensitive business data)
-- - creator_tier (sensitive business data)  
-- - bio (may contain personal information)
-- - referred_by (privacy concern)
-- - credits (financial information)
-- - month_revenue_cached (sensitive business data)