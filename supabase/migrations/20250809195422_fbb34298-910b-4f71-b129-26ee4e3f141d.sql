-- Update creator tier calculation to use revenue instead of commission
CREATE OR REPLACE FUNCTION public.calculate_creator_tier_by_revenue(monthly_revenue numeric)
 RETURNS TABLE(tier text, commission_rate numeric)
 LANGUAGE sql
 IMMUTABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

-- Update creator metrics to use revenue-based tier calculation
CREATE OR REPLACE FUNCTION public.update_creator_metrics_by_revenue(creator_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  current_month DATE;
  monthly_revenue NUMERIC;
  monthly_commission NUMERIC;
  orders_count INTEGER;
  customers_count INTEGER;
  new_tier TEXT;
  new_commission_rate NUMERIC;
  current_tier TEXT;
BEGIN
  -- Get current month (first day)
  current_month := date_trunc('month', NOW() AT TIME ZONE 'UTC')::date;
  
  -- Get current tier to prevent downgrades from higher tiers
  SELECT creator_tier INTO current_tier 
  FROM public.profiles 
  WHERE user_id = creator_user_id;
  
  -- Calculate this month's metrics based on orders attributed via coupon code
  SELECT 
    COALESCE(SUM(order_total), 0),
    COALESCE(SUM(commission_amount_at_purchase), 0),
    COUNT(*),
    COUNT(DISTINCT user_id)
  INTO monthly_revenue, monthly_commission, orders_count, customers_count
  FROM public.orders 
  WHERE creator_id = creator_user_id 
    AND status = 'paid'
    AND created_at >= current_month
    AND created_at < current_month + INTERVAL '1 month';
  
  -- Calculate new tier and commission rate based on REVENUE
  SELECT tier, commission_rate 
  INTO new_tier, new_commission_rate
  FROM public.calculate_creator_tier_by_revenue(monthly_revenue);
  
  -- Only upgrade tiers, never downgrade once achieved
  IF (current_tier = 'tier1' AND new_tier IN ('tier2', 'tier3')) OR
     (current_tier = 'tier2' AND new_tier = 'tier3') OR
     (DATE_PART('day', NOW()) = 1) THEN
    -- Upgrade tier or it's first day of month (recalc)
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
$function$;

-- Update the paid order trigger to use revenue-based metrics
CREATE OR REPLACE FUNCTION public.handle_paid_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    
    -- Update creator metrics using REVENUE-based calculation
    PERFORM public.update_creator_metrics_by_revenue(NEW.creator_id);
  END IF;
  
  RETURN NEW;
END;
$function$;