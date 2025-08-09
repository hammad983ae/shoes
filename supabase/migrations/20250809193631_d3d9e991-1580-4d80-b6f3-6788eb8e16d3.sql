-- Fix security warnings by adding proper search path to functions
CREATE OR REPLACE FUNCTION public.apply_coupon_to_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.handle_paid_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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