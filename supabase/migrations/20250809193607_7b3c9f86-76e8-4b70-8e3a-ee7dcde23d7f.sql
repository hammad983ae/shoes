-- First, let's add a coupon_code column to profiles for unique coupon codes
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS coupon_code TEXT UNIQUE;

-- Create a credits_ledger table for tracking admin grants and other credit transactions
CREATE TABLE IF NOT EXISTS public.credits_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('admin_grant', 'video_submission', 'referral', 'purchase', 'withdrawal')),
  notes TEXT,
  admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on credits_ledger
ALTER TABLE public.credits_ledger ENABLE ROW LEVEL SECURITY;

-- Add creator_id and commission tracking to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS commission_amount_at_purchase NUMERIC DEFAULT 0;

-- Create creator monthly metrics tracking table
CREATE TABLE IF NOT EXISTS public.creator_monthly_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- First day of the month
  total_orders INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  total_commission NUMERIC DEFAULT 0,
  customers_acquired INTEGER DEFAULT 0,
  aov NUMERIC DEFAULT 0,
  video_credits_granted INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(creator_id, month)
);

-- Enable RLS on creator_monthly_metrics
ALTER TABLE public.creator_monthly_metrics ENABLE ROW LEVEL SECURITY;

-- Add video credits tracking to user_credits
ALTER TABLE public.user_credits 
ADD COLUMN IF NOT EXISTS video_credits_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_video_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_video_credit_reset DATE DEFAULT DATE_TRUNC('month', NOW())::DATE;

-- RLS Policies for credits_ledger
CREATE POLICY "Users can view their own credit transactions" ON public.credits_ledger
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all credit transactions" ON public.credits_ledger
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert credit transactions" ON public.credits_ledger
  FOR INSERT WITH CHECK (is_admin());

-- RLS Policies for creator_monthly_metrics
CREATE POLICY "Creators can view their own metrics" ON public.creator_monthly_metrics
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Admins can view all creator metrics" ON public.creator_monthly_metrics
  FOR SELECT USING (is_admin());

CREATE POLICY "System can manage creator metrics" ON public.creator_monthly_metrics
  FOR ALL USING (true);

-- Update the tier calculation function to use commission instead of revenue
CREATE OR REPLACE FUNCTION public.calculate_creator_tier_by_commission(monthly_commission numeric)
RETURNS TABLE(tier text, commission_rate numeric)
LANGUAGE sql
IMMUTABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    CASE 
      WHEN monthly_commission >= 5000 THEN 'tier2'
      ELSE 'tier1'
    END as tier,
    CASE 
      WHEN monthly_commission >= 5000 THEN 0.15
      ELSE 0.10
    END as commission_rate;
$$;

-- Function to update creator metrics based on commission earned
CREATE OR REPLACE FUNCTION public.update_creator_metrics_by_commission(creator_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_month DATE;
  monthly_commission NUMERIC;
  orders_count INTEGER;
  monthly_revenue NUMERIC;
  customers_count INTEGER;
  new_tier TEXT;
  new_commission_rate NUMERIC;
  current_tier TEXT;
BEGIN
  -- Get current month (first day)
  current_month := date_trunc('month', NOW() AT TIME ZONE 'UTC')::date;
  
  -- Get current tier to prevent downgrades from tier2
  SELECT creator_tier INTO current_tier 
  FROM public.profiles 
  WHERE user_id = creator_user_id;
  
  -- Calculate this month's metrics
  SELECT 
    COALESCE(SUM(commission_amount_at_purchase), 0),
    COUNT(*),
    COALESCE(SUM(order_total), 0),
    COUNT(DISTINCT user_id)
  INTO monthly_commission, orders_count, monthly_revenue, customers_count
  FROM public.orders 
  WHERE creator_id = creator_user_id 
    AND status = 'paid'
    AND created_at >= current_month
    AND created_at < current_month + INTERVAL '1 month';
  
  -- Calculate new tier and commission rate based on commission
  SELECT tier, commission_rate 
  INTO new_tier, new_commission_rate
  FROM public.calculate_creator_tier_by_commission(monthly_commission);
  
  -- Only upgrade to tier2, never downgrade once reached
  IF current_tier = 'tier1' AND new_tier = 'tier2' THEN
    -- Upgrade to tier2
    UPDATE public.profiles 
    SET 
      creator_tier = new_tier,
      commission_rate = new_commission_rate,
      month_revenue_cached = monthly_revenue,
      month_updated_at = NOW()
    WHERE user_id = creator_user_id;
  ELSIF current_tier != 'tier2' OR DATE_PART('day', NOW()) = 1 THEN
    -- Update cached revenue but keep tier if already tier2
    UPDATE public.profiles 
    SET 
      month_revenue_cached = monthly_revenue,
      month_updated_at = NOW()
    WHERE user_id = creator_user_id;
  END IF;
  
  -- Upsert monthly metrics
  INSERT INTO public.creator_monthly_metrics 
    (creator_id, month, total_orders, total_revenue, total_commission, customers_acquired, aov, updated_at)
  VALUES 
    (creator_user_id, current_month, orders_count, monthly_revenue, monthly_commission, customers_count,
     CASE WHEN orders_count > 0 THEN monthly_revenue / orders_count ELSE 0 END, NOW())
  ON CONFLICT (creator_id, month) 
  DO UPDATE SET 
    total_orders = EXCLUDED.total_orders,
    total_revenue = EXCLUDED.total_revenue,
    total_commission = EXCLUDED.total_commission,
    customers_acquired = EXCLUDED.customers_acquired,
    aov = EXCLUDED.aov,
    updated_at = NOW();
END;
$$;

-- Function to grant credits to a user (admin only)
CREATE OR REPLACE FUNCTION public.grant_user_credits(
  target_user_id uuid,
  credit_amount integer,
  credit_type text DEFAULT 'admin_grant',
  notes_text text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Only admins can grant credits
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can grant credits';
  END IF;

  -- Validate credit amount
  IF credit_amount <= 0 THEN
    RAISE EXCEPTION 'Credit amount must be positive';
  END IF;

  -- Insert credit transaction
  INSERT INTO public.credits_ledger (user_id, amount, type, notes, admin_id)
  VALUES (target_user_id, credit_amount, credit_type, notes_text, auth.uid());

  -- Update user credit balance
  UPDATE public.user_credits
  SET 
    current_balance = current_balance + credit_amount,
    total_earned = total_earned + credit_amount,
    updated_at = NOW()
  WHERE user_id = target_user_id;

  -- If this is video credits, update video-specific tracking
  IF credit_type = 'video_submission' THEN
    UPDATE public.user_credits
    SET 
      video_credits_this_month = video_credits_this_month + credit_amount,
      lifetime_video_credits = lifetime_video_credits + credit_amount
    WHERE user_id = target_user_id;
  END IF;

  RETURN TRUE;
END;
$$;

-- Function to handle coupon code attribution on orders
CREATE OR REPLACE FUNCTION public.apply_coupon_to_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  creator_user_id UUID;
  creator_commission_rate NUMERIC;
  commission_amount NUMERIC;
BEGIN
  -- If a coupon code is provided, find the creator
  IF NEW.coupon_code IS NOT NULL THEN
    SELECT user_id, commission_rate INTO creator_user_id, creator_commission_rate
    FROM public.profiles
    WHERE coupon_code = NEW.coupon_code AND is_creator = true;
    
    -- If valid creator found, set creator_id and calculate commission
    IF creator_user_id IS NOT NULL THEN
      NEW.creator_id := creator_user_id;
      commission_amount := NEW.order_total * creator_commission_rate;
      NEW.commission_amount_at_purchase := commission_amount;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to apply coupon codes on order creation
DROP TRIGGER IF EXISTS apply_coupon_on_order ON public.orders;
CREATE TRIGGER apply_coupon_on_order
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.apply_coupon_to_order();

-- Update the existing handle_paid_order function to use commission-based metrics
CREATE OR REPLACE FUNCTION public.handle_paid_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  is_first_order BOOLEAN;
BEGIN
  -- Only process when status changes to 'paid' and creator_id is set
  IF NEW.status = 'paid' AND NEW.creator_id IS NOT NULL AND 
     (OLD IS NULL OR OLD.status != 'paid') THEN
    
    -- Insert creator earnings record (if not already exists from commission calculation)
    INSERT INTO public.creator_earnings 
      (creator_id, order_id, order_total, commission_rate_at_purchase, commission_amount)
    VALUES 
      (NEW.creator_id, NEW.id, NEW.order_total, 
       NEW.commission_amount_at_purchase / NEW.order_total, 
       NEW.commission_amount_at_purchase)
    ON CONFLICT (order_id) DO NOTHING;
    
    -- Check if this is customer's first order for LTV tracking
    SELECT NOT EXISTS(
      SELECT 1 FROM public.orders 
      WHERE user_id = NEW.user_id AND status = 'paid' AND id != NEW.id
    ) INTO is_first_order;
    
    -- If first order, record customer acquisition
    IF is_first_order THEN
      INSERT INTO public.customer_acquisition 
        (first_order_user_id, creator_id, first_order_date)
      VALUES 
        (NEW.user_id, NEW.creator_id, NEW.created_at)
      ON CONFLICT (first_order_user_id) DO NOTHING;
    END IF;
    
    -- Update creator metrics using commission-based calculation
    PERFORM public.update_creator_metrics_by_commission(NEW.creator_id);
  END IF;
  
  RETURN NEW;
END;
$$;