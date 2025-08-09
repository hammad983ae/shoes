-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  creator_id UUID NULL,
  order_total NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Add creator fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS creator_tier TEXT DEFAULT 'tier1',
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC DEFAULT 0.10,
ADD COLUMN IF NOT EXISTS month_revenue_cached NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS month_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create creator_earnings table (ledger)
CREATE TABLE IF NOT EXISTS public.creator_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  order_id UUID NOT NULL,
  order_total NUMERIC NOT NULL,
  commission_rate_at_purchase NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on creator_earnings
ALTER TABLE public.creator_earnings ENABLE ROW LEVEL SECURITY;

-- Create creator_credits_ledger table
CREATE TABLE IF NOT EXISTS public.creator_credits_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video_bonus', 'adjustment', 'redeem')),
  amount_credits INTEGER NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on creator_credits_ledger
ALTER TABLE public.creator_credits_ledger ENABLE ROW LEVEL SECURITY;

-- Create creator_metrics_monthly table
CREATE TABLE IF NOT EXISTS public.creator_metrics_monthly (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  month DATE NOT NULL, -- YYYY-MM-01 format
  revenue NUMERIC DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  aov NUMERIC DEFAULT 0,
  ltv NUMERIC DEFAULT 0,
  commission_paid NUMERIC DEFAULT 0,
  tier TEXT DEFAULT 'tier1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(creator_id, month)
);

-- Enable RLS on creator_metrics_monthly
ALTER TABLE public.creator_metrics_monthly ENABLE ROW LEVEL SECURITY;

-- Create customer_acquisition table for LTV calculation
CREATE TABLE IF NOT EXISTS public.customer_acquisition (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_order_user_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  first_order_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(first_order_user_id)
);

-- Enable RLS on customer_acquisition
ALTER TABLE public.customer_acquisition ENABLE ROW LEVEL SECURITY;

-- Function to calculate creator tier based on monthly revenue
CREATE OR REPLACE FUNCTION public.calculate_creator_tier(monthly_revenue NUMERIC)
RETURNS TABLE(tier TEXT, commission_rate NUMERIC)
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 
    CASE 
      WHEN monthly_revenue >= 15000 THEN 'tier3'
      WHEN monthly_revenue >= 5000 THEN 'tier2'
      ELSE 'tier1'
    END as tier,
    CASE 
      WHEN monthly_revenue >= 15000 THEN 0.20
      WHEN monthly_revenue >= 5000 THEN 0.15
      ELSE 0.10
    END as commission_rate;
$$;

-- Function to update creator tier and metrics
CREATE OR REPLACE FUNCTION public.update_creator_metrics(creator_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month DATE;
  monthly_revenue NUMERIC;
  orders_count INTEGER;
  new_tier TEXT;
  new_commission_rate NUMERIC;
  current_tier TEXT;
BEGIN
  -- Get current month (first day)
  current_month := date_trunc('month', NOW() AT TIME ZONE 'UTC')::date;
  
  -- Get current tier to prevent mid-month downgrades
  SELECT creator_tier INTO current_tier 
  FROM public.profiles 
  WHERE user_id = creator_user_id;
  
  -- Calculate this month's revenue and order count
  SELECT 
    COALESCE(SUM(order_total), 0),
    COUNT(*)
  INTO monthly_revenue, orders_count
  FROM public.orders 
  WHERE creator_id = creator_user_id 
    AND status = 'paid'
    AND created_at >= current_month
    AND created_at < current_month + INTERVAL '1 month';
  
  -- Calculate new tier and commission rate
  SELECT tier, commission_rate 
  INTO new_tier, new_commission_rate
  FROM public.calculate_creator_tier(monthly_revenue);
  
  -- Only upgrade mid-month, never downgrade
  IF current_tier = 'tier1' OR 
     (current_tier = 'tier2' AND new_tier = 'tier3') OR
     (DATE_PART('day', NOW()) = 1) THEN
    -- Update profiles with new tier and commission rate
    UPDATE public.profiles 
    SET 
      creator_tier = new_tier,
      commission_rate = new_commission_rate,
      month_revenue_cached = monthly_revenue,
      month_updated_at = NOW()
    WHERE user_id = creator_user_id;
  ELSE
    -- Just update cached revenue, keep current tier
    UPDATE public.profiles 
    SET 
      month_revenue_cached = monthly_revenue,
      month_updated_at = NOW()
    WHERE user_id = creator_user_id;
  END IF;
  
  -- Upsert monthly metrics
  INSERT INTO public.creator_metrics_monthly 
    (creator_id, month, revenue, orders_count, aov, tier, updated_at)
  VALUES 
    (creator_user_id, current_month, monthly_revenue, orders_count, 
     CASE WHEN orders_count > 0 THEN monthly_revenue / orders_count ELSE 0 END,
     new_tier, NOW())
  ON CONFLICT (creator_id, month) 
  DO UPDATE SET 
    revenue = EXCLUDED.revenue,
    orders_count = EXCLUDED.orders_count,
    aov = EXCLUDED.aov,
    tier = EXCLUDED.tier,
    updated_at = NOW();
END;
$$;

-- Function to handle paid orders
CREATE OR REPLACE FUNCTION public.handle_paid_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  creator_commission_rate NUMERIC;
  commission_amount NUMERIC;
  is_first_order BOOLEAN;
BEGIN
  -- Only process when status changes to 'paid' and creator_id is set
  IF NEW.status = 'paid' AND NEW.creator_id IS NOT NULL AND 
     (OLD IS NULL OR OLD.status != 'paid') THEN
    
    -- Get current commission rate for creator
    SELECT commission_rate INTO creator_commission_rate
    FROM public.profiles
    WHERE user_id = NEW.creator_id;
    
    -- Calculate commission
    commission_amount := NEW.order_total * creator_commission_rate;
    
    -- Insert creator earnings record
    INSERT INTO public.creator_earnings 
      (creator_id, order_id, order_total, commission_rate_at_purchase, commission_amount)
    VALUES 
      (NEW.creator_id, NEW.id, NEW.order_total, creator_commission_rate, commission_amount);
    
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
    
    -- Update creator metrics and tier
    PERFORM public.update_creator_metrics(NEW.creator_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for paid orders
DROP TRIGGER IF EXISTS handle_paid_order_trigger ON public.orders;
CREATE TRIGGER handle_paid_order_trigger
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_paid_order();

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for creator_earnings
CREATE POLICY "Creators can view their own earnings" ON public.creator_earnings
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Admins can view all earnings" ON public.creator_earnings
  FOR SELECT USING (is_admin());

-- RLS Policies for creator_credits_ledger
CREATE POLICY "Creators can view their own credits" ON public.creator_credits_ledger
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Creators can create their own credit requests" ON public.creator_credits_ledger
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Admins can manage all credits" ON public.creator_credits_ledger
  FOR ALL USING (is_admin());

-- RLS Policies for creator_metrics_monthly
CREATE POLICY "Creators can view their own metrics" ON public.creator_metrics_monthly
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Admins can view all metrics" ON public.creator_metrics_monthly
  FOR SELECT USING (is_admin());

-- RLS Policies for customer_acquisition
CREATE POLICY "Creators can view their acquisitions" ON public.customer_acquisition
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Admins can view all acquisitions" ON public.customer_acquisition
  FOR SELECT USING (is_admin());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_creator_id ON public.orders(creator_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_creator_earnings_creator_id ON public.creator_earnings(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_credits_creator_id ON public.creator_credits_ledger(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_metrics_creator_month ON public.creator_metrics_monthly(creator_id, month);