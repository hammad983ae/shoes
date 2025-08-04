-- Add missing columns for referral system
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referrals_count INTEGER DEFAULT 0;
ALTER TABLE public.user_credits ADD COLUMN IF NOT EXISTS earned_from_referrals INTEGER DEFAULT 0;
ALTER TABLE public.post_analytics ADD COLUMN IF NOT EXISTS credits_earned INTEGER DEFAULT 0;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_referrals_count ON public.profiles(referrals_count);
CREATE INDEX IF NOT EXISTS idx_user_credits_earned_from_referrals ON public.user_credits(earned_from_referrals);