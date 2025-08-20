-- Fix critical security issue: unified_credits view exposing financial data
-- This view combines user_credits and profiles data and is currently publicly accessible

-- First, enable RLS on the unified_credits view
ALTER VIEW public.unified_credits SET (security_barrier = true);

-- Drop and recreate the view as a security definer view with proper access control
DROP VIEW IF EXISTS public.unified_credits;

-- Create a secure function to get unified credits data
CREATE OR REPLACE FUNCTION public.get_unified_credits(_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  user_id uuid,
  current_balance integer,
  total_earned integer,
  total_spent integer,
  earned_from_referrals integer,
  video_credits_this_month integer,
  lifetime_video_credits integer,
  is_creator boolean,
  creator_tier text,
  commission_rate numeric
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT 
    uc.user_id,
    uc.current_balance,
    uc.total_earned,
    uc.total_spent,
    uc.earned_from_referrals,
    uc.video_credits_this_month,
    uc.lifetime_video_credits,
    p.is_creator,
    p.creator_tier,
    p.commission_rate
  FROM public.user_credits uc
  LEFT JOIN public.profiles p ON uc.user_id = p.user_id
  WHERE uc.user_id = _user_id
    AND (
      -- Users can only see their own data
      auth.uid() = uc.user_id
      -- Admins can see all data
      OR public.is_admin()
    );
$$;

-- Create a secure view that uses the function for authenticated users only
CREATE VIEW public.unified_credits 
WITH (security_barrier = true) AS
SELECT * FROM public.get_unified_credits(auth.uid())
WHERE auth.uid() IS NOT NULL;

-- Enable RLS on the view
ALTER VIEW public.unified_credits ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for the view
CREATE POLICY "Users can only view their own unified credits"
  ON public.unified_credits
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT SELECT ON public.unified_credits TO authenticated;
REVOKE ALL ON public.unified_credits FROM anon;

-- Also ensure the underlying user_credits table has proper RLS
-- (it should already have it, but let's verify)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_credits'
  ) THEN
    -- If no policies exist on user_credits, create them
    CREATE POLICY "Users can manage their own credits"
      ON public.user_credits
      FOR ALL
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;