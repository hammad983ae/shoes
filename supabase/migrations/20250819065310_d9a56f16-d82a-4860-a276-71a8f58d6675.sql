-- Create social verification system

-- Drop existing social_connections table if it exists to recreate with new structure
DROP TABLE IF EXISTS public.social_connections CASCADE;

-- Create social verification requests table
CREATE TABLE public.social_verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  username TEXT NOT NULL,
  screenshot_url TEXT,
  follower_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create verified social connections table
CREATE TABLE public.social_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  username TEXT NOT NULL,
  follower_count INTEGER NOT NULL DEFAULT 0,
  payout_tier_credits INTEGER NOT NULL DEFAULT 2000, -- Credits per video based on follower count
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable RLS
ALTER TABLE public.social_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_verification_requests
CREATE POLICY "Users can create their own verification requests" ON public.social_verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own verification requests" ON public.social_verification_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all verification requests" ON public.social_verification_requests
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update verification requests" ON public.social_verification_requests
  FOR UPDATE USING (is_admin());

-- RLS Policies for social_connections
CREATE POLICY "Users can view their own social connections" ON public.social_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view social connections for discovery" ON public.social_connections
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage social connections" ON public.social_connections
  FOR ALL USING (is_admin());

-- Function to calculate payout tier credits based on follower count
CREATE OR REPLACE FUNCTION public.calculate_payout_tier_credits(follower_count INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  CASE 
    WHEN follower_count >= 1000000 THEN RETURN 15000; -- $150
    WHEN follower_count >= 500000 THEN RETURN 10000; -- $100
    WHEN follower_count >= 100000 THEN RETURN 7500;  -- $75
    WHEN follower_count >= 50000 THEN RETURN 5000;   -- $50
    WHEN follower_count >= 10000 THEN RETURN 3500;   -- $35
    ELSE RETURN 2000; -- $20 (under 10k)
  END CASE;
END;
$$;

-- Trigger to auto-update payout tier when follower count changes
CREATE OR REPLACE FUNCTION public.update_payout_tier_on_follower_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.payout_tier_credits = public.calculate_payout_tier_credits(NEW.follower_count);
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_social_connection_payout_tier
  BEFORE INSERT OR UPDATE OF follower_count
  ON public.social_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payout_tier_on_follower_change();

-- Function to approve social verification and create social connection
CREATE OR REPLACE FUNCTION public.approve_social_verification(request_id UUID, verified_follower_count INTEGER DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  request_record RECORD;
  final_follower_count INTEGER;
BEGIN
  -- Only admins can approve
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Get the verification request
  SELECT * INTO request_record 
  FROM public.social_verification_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Verification request not found or already processed';
  END IF;
  
  -- Use verified follower count if provided, otherwise use the original
  final_follower_count = COALESCE(verified_follower_count, request_record.follower_count);
  
  -- Update request status
  UPDATE public.social_verification_requests 
  SET 
    status = 'approved',
    follower_count = final_follower_count,
    verified_by = auth.uid(),
    updated_at = now()
  WHERE id = request_id;
  
  -- Create verified social connection
  INSERT INTO public.social_connections (user_id, platform, username, follower_count)
  VALUES (request_record.user_id, request_record.platform, request_record.username, final_follower_count)
  ON CONFLICT (user_id, platform) 
  DO UPDATE SET 
    username = EXCLUDED.username,
    follower_count = EXCLUDED.follower_count,
    updated_at = now();
  
  -- Send notification to user
  INSERT INTO public.notifications (user_id, message)
  VALUES (request_record.user_id, 'Your ' || request_record.platform || ' account has been verified! You can now earn credits for videos.');
  
  RETURN TRUE;
END;
$$;

-- Function for creators to payout for one video
CREATE OR REPLACE FUNCTION public.payout_video_credits(creator_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  highest_tier_credits INTEGER := 0;
  social_conn RECORD;
  credits_added INTEGER;
BEGIN
  -- Only admins can trigger payouts
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Get the highest payout tier from user's verified social connections
  SELECT payout_tier_credits INTO highest_tier_credits
  FROM public.social_connections 
  WHERE user_id = creator_user_id 
  ORDER BY payout_tier_credits DESC 
  LIMIT 1;
  
  -- If no social connections, use default tier (under 10k)
  IF highest_tier_credits IS NULL THEN
    highest_tier_credits := 2000; -- $20 default
  END IF;
  
  credits_added := highest_tier_credits;
  
  -- Add credits to user
  INSERT INTO public.credits_ledger (user_id, amount, type, notes, admin_id)
  VALUES (creator_user_id, credits_added, 'video_payout', 'Credits for posting a video', auth.uid());
  
  -- Update user credit balance
  UPDATE public.user_credits
  SET 
    current_balance = current_balance + credits_added,
    total_earned = total_earned + credits_added,
    updated_at = now()
  WHERE user_id = creator_user_id;
  
  -- Create if user_credits record doesn't exist
  INSERT INTO public.user_credits (user_id, current_balance, total_earned, total_spent)
  VALUES (creator_user_id, credits_added, credits_added, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Send notification
  INSERT INTO public.notifications (user_id, message)
  VALUES (creator_user_id, 'You received ' || credits_added || ' credits for posting a video! Keep creating content to earn more.');
  
  RETURN jsonb_build_object(
    'success', true, 
    'credits_added', credits_added,
    'tier_amount', highest_tier_credits
  );
END;
$$;