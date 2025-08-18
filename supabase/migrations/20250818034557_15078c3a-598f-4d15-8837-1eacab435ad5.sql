-- Add missing columns to existing tables
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS quality_check_image TEXT,
ADD COLUMN IF NOT EXISTS fulfillment_notes TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_spent NUMERIC DEFAULT 0;

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS infinite_stock BOOLEAN DEFAULT false;

-- Create site analytics realtime table
CREATE TABLE IF NOT EXISTS public.site_analytics_realtime (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  hour INTEGER DEFAULT EXTRACT(HOUR FROM NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.site_analytics_realtime ENABLE ROW LEVEL SECURITY;

-- Create creator invites table
CREATE TABLE IF NOT EXISTS public.creator_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  tier TEXT DEFAULT 'tier1',
  coupon_code TEXT NOT NULL UNIQUE,
  starting_credits INTEGER DEFAULT 0,
  tiktok_username TEXT,
  followers INTEGER DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  invite_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.creator_invites ENABLE ROW LEVEL SECURITY;