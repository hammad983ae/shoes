-- Create site analytics table for realtime data
CREATE TABLE IF NOT EXISTS public.site_analytics_realtime (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  hour INTEGER DEFAULT EXTRACT(HOUR FROM NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create unique index for upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_analytics_realtime_unique 
ON public.site_analytics_realtime (metric_type, date, hour);

-- Enable RLS
ALTER TABLE public.site_analytics_realtime ENABLE ROW LEVEL SECURITY;

-- Create policies for site analytics
CREATE POLICY "Anyone can view site analytics realtime" 
ON public.site_analytics_realtime 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage site analytics realtime" 
ON public.site_analytics_realtime 
FOR ALL 
USING (true);

-- Add quality_check_image and tracking_number columns to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS quality_check_image TEXT,
ADD COLUMN IF NOT EXISTS fulfillment_notes TEXT;

-- Create creator_invites table
CREATE TABLE IF NOT EXISTS public.creator_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  tier TEXT DEFAULT 'tier1' CHECK (tier IN ('tier1', 'tier2', 'tier3')),
  coupon_code TEXT NOT NULL UNIQUE,
  starting_credits INTEGER DEFAULT 0,
  tiktok_username TEXT,
  followers INTEGER DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'revoked')),
  invite_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for creator invites
ALTER TABLE public.creator_invites ENABLE ROW LEVEL SECURITY;

-- Create policies for creator invites
CREATE POLICY "Admins can manage creator invites" 
ON public.creator_invites 
FOR ALL 
USING (is_admin());

-- Add admin_notes column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'banned')),
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_spent NUMERIC DEFAULT 0;

-- Create user_credits table if not exists
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
  current_balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  earned_from_referrals INTEGER DEFAULT 0,
  video_credits_this_month INTEGER DEFAULT 0,
  lifetime_video_credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for user_credits
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Create policies for user_credits
CREATE POLICY "Users can view their own credits" 
ON public.user_credits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all credits" 
ON public.user_credits 
FOR SELECT 
USING (is_admin());

CREATE POLICY "System can manage credits" 
ON public.user_credits 
FOR ALL 
USING (true);

-- Add infinite_stock column to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS infinite_stock BOOLEAN DEFAULT false;

-- Function to export data as CSV (will be used by edge functions)
CREATE OR REPLACE FUNCTION public.export_table_csv(table_name TEXT, conditions TEXT DEFAULT '')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  result TEXT;
BEGIN
  -- Only allow admin access
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- This is a placeholder - actual CSV export will be handled by edge functions
  RETURN 'CSV export functionality requires edge function implementation';
END;
$$;