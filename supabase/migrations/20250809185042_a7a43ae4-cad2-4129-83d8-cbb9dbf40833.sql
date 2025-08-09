-- Fix security warnings by setting proper search paths for functions

-- Update calculate_creator_tier function with proper search path
CREATE OR REPLACE FUNCTION public.calculate_creator_tier(monthly_revenue NUMERIC)
RETURNS TABLE(tier TEXT, commission_rate NUMERIC)
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = ''
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

-- Update update_creator_metrics function with proper search path
CREATE OR REPLACE FUNCTION public.update_creator_metrics(creator_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- Update handle_paid_order function with proper search path
CREATE OR REPLACE FUNCTION public.handle_paid_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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