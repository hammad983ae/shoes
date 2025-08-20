-- Fix the materialized view API exposure warning
-- Remove public API access to materialized view and make it internal-only

-- Revoke public access to materialized view
REVOKE ALL ON public.post_view_counts_materialized FROM authenticated;
REVOKE ALL ON public.post_view_counts_materialized FROM anon;

-- Make the materialized view only accessible through the secure function
-- This way we control access through the function rather than direct table access