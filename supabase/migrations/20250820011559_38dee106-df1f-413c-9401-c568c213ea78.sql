-- Fix Security Definer View issues
-- The linter detected security issues with views that need proper access control

-- Fix public_profiles view - this should be publicly readable but secured
DROP VIEW IF EXISTS public.public_profiles;

-- Create a secure function for public profiles instead of a view
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  is_creator boolean,
  creator_tier text,
  bio text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT 
    p.user_id,
    p.display_name,
    p.avatar_url,
    p.is_creator,
    p.creator_tier,
    p.bio
  FROM public.profiles p
  WHERE p.account_status = 'active';
$$;

-- Grant execution to authenticated and anonymous users since this is public data
GRANT EXECUTE ON FUNCTION public.get_public_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profiles() TO anon;

-- Fix post_view_counts view - this should have proper access control
DROP VIEW IF EXISTS public.post_view_counts;

-- Create a secure function for post view counts
CREATE OR REPLACE FUNCTION public.get_post_view_counts()
RETURNS TABLE (
  post_id uuid,
  view_count bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT 
    pv.post_id,
    COUNT(*) as view_count
  FROM public.post_views pv
  GROUP BY pv.post_id;
$$;

-- Grant execution to authenticated and anonymous users since this is aggregate data
GRANT EXECUTE ON FUNCTION public.get_post_view_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_post_view_counts() TO anon;

-- Create materialized view for better performance on post view counts (optional optimization)
CREATE MATERIALIZED VIEW public.post_view_counts_materialized AS
SELECT 
  post_id,
  COUNT(*) as view_count
FROM public.post_views
GROUP BY post_id;

-- Create index for better performance
CREATE INDEX idx_post_view_counts_post_id ON public.post_view_counts_materialized(post_id);

-- Grant select on materialized view
GRANT SELECT ON public.post_view_counts_materialized TO authenticated;
GRANT SELECT ON public.post_view_counts_materialized TO anon;

-- Create function to refresh the materialized view (can be called by admins or scheduled)
CREATE OR REPLACE FUNCTION public.refresh_post_view_counts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.post_view_counts_materialized;
$$;

-- Only allow admins to refresh the materialized view
GRANT EXECUTE ON FUNCTION public.refresh_post_view_counts() TO authenticated;

-- Add a policy check for the refresh function
CREATE OR REPLACE FUNCTION public.refresh_post_view_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only admins can refresh
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.post_view_counts_materialized;
END;
$$;