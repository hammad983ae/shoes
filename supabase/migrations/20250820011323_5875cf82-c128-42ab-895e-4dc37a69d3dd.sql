-- Fix critical security issue: unified_credits view exposing financial data
-- Views cannot have RLS, so we'll replace it with a secure function approach

-- Drop the insecure public view
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

-- Grant execution permission only to authenticated users
GRANT EXECUTE ON FUNCTION public.get_unified_credits(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.get_unified_credits(uuid) FROM anon;

-- Ensure user_credits table has proper RLS policies
DO $$
BEGIN
  -- Check if user_credits table has RLS enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
    AND c.relname = 'user_credits'
    AND c.relrowsecurity = true
  ) THEN
    -- Enable RLS on user_credits if not already enabled
    ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Check if policies exist on user_credits
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_credits'
  ) THEN
    -- Create RLS policies for user_credits
    CREATE POLICY "Users can manage their own credits"
      ON public.user_credits
      FOR ALL
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
      
    CREATE POLICY "Admins can manage all credits"
      ON public.user_credits
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;