-- FIX ALL REMAINING FUNCTIONS WITH MISSING SEARCH_PATH
-- This completes the security hardening for function search path vulnerabilities

-- Fix all remaining security definer functions that need search_path
ALTER FUNCTION public.admin_find_user_by_email(text) SET search_path = 'public';
ALTER FUNCTION public.apply_coupon_to_order() SET search_path = 'public';
ALTER FUNCTION public.auto_generate_coupon_code() SET search_path = '';
ALTER FUNCTION public.calculate_estimated_delivery() SET search_path = 'public';
ALTER FUNCTION public.clear_cart_on_order_completion() SET search_path = 'public';
ALTER FUNCTION public.create_welcome_notification() SET search_path = '';
ALTER FUNCTION public.get_current_user_role() SET search_path = '';
ALTER FUNCTION public.get_post_view_counts() SET search_path = '';
ALTER FUNCTION public.get_public_profiles() SET search_path = '';
ALTER FUNCTION public.get_unified_credits(uuid) SET search_path = '';
ALTER FUNCTION public.nudge_browsing_now() SET search_path = '';
ALTER FUNCTION public.refresh_post_view_counts() SET search_path = '';
ALTER FUNCTION public.send_order_webhook() SET search_path = 'public';
ALTER FUNCTION public.sync_user_last_login() SET search_path = 'public';
ALTER FUNCTION public.track_order_analytics() SET search_path = 'public';
ALTER FUNCTION public.update_post_like_count() SET search_path = '';
ALTER FUNCTION public.update_post_view_count() SET search_path = '';
ALTER FUNCTION public.update_profile_last_login() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';

-- Functions that are trigger functions need 'public' search_path to access tables
-- Functions that are security barriers use '' for maximum security

-- Add final security verification
DO $$
DECLARE
  remaining_functions INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_functions
  FROM pg_proc p 
  JOIN pg_namespace n ON p.pronamespace = n.oid 
  WHERE n.nspname = 'public' 
  AND p.prosecdef = true 
  AND NOT (p.proconfig @> ARRAY['search_path=']);
  
  IF remaining_functions = 0 THEN
    RAISE NOTICE 'SUCCESS: All security definer functions now have proper search_path settings';
  ELSE
    RAISE NOTICE 'WARNING: % functions still need search_path configuration', remaining_functions;
  END IF;
END $$;