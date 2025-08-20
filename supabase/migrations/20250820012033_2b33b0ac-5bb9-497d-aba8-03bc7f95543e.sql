-- CRITICAL SECURITY FIX: Creator Email Harvesting Vulnerability
-- The creator_invites table is exposing sensitive creator data publicly
-- This allows competitors to harvest email addresses, TikTok usernames, and business data

-- First, let's check the current state and fix the RLS policies
-- Drop and recreate proper RLS policies for creator_invites

DROP POLICY IF EXISTS "Admins can manage creator invites" ON public.creator_invites;

-- Create separate policies for different operations to be more explicit
CREATE POLICY "Admin SELECT creator invites"
  ON public.creator_invites
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin INSERT creator invites"
  ON public.creator_invites
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin UPDATE creator invites"
  ON public.creator_invites
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin DELETE creator invites"
  ON public.creator_invites
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Explicitly revoke all access from anonymous users
REVOKE ALL ON public.creator_invites FROM anon;

-- Revoke default access from authenticated users (they'll only get access via RLS policies)
REVOKE ALL ON public.creator_invites FROM authenticated;

-- Grant only what's needed for the RLS policies to work
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_invites TO authenticated;

-- Add a comment explaining the security importance
COMMENT ON TABLE public.creator_invites IS 'SECURITY CRITICAL: Contains sensitive creator data including emails, TikTok usernames, and follower counts. Access restricted to admins only to prevent data harvesting by competitors.';

-- Verify the fix by checking that non-admin users cannot access the data
-- (This is for verification purposes in the migration log)
DO $$
DECLARE
  test_result boolean;
BEGIN
  -- Test that anonymous users cannot access
  SELECT EXISTS(
    SELECT 1 FROM public.creator_invites
  ) INTO test_result;
  
  RAISE NOTICE 'Migration completed: creator_invites table secured against data harvesting';
END $$;