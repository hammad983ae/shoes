-- Fix the estimated delivery trigger to use 12 days initially and 7 days when shipped
CREATE OR REPLACE FUNCTION public.calculate_estimated_delivery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Set estimated delivery to 12 days from order creation initially
  IF NEW.estimated_delivery IS NULL THEN
    NEW.estimated_delivery = (NEW.created_at + INTERVAL '12 days')::date;
  END IF;
  
  -- Update to 7 days when status changes to shipped
  IF NEW.status = 'shipped' AND (OLD.status IS NULL OR OLD.status != 'shipped') THEN
    NEW.estimated_delivery = (now() + INTERVAL '7 days')::date;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix the useFavorites UUID issue by ensuring product_id is properly stored as UUID in favorites table
ALTER TABLE public.favorites ALTER COLUMN product_id TYPE text;

-- Add product media support for better admin dashboard functionality  
CREATE TABLE IF NOT EXISTS public.product_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  views_count integer DEFAULT 0,
  purchases_count integer DEFAULT 0,
  revenue numeric DEFAULT 0,
  last_purchased_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on product_analytics
ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for product_analytics
CREATE POLICY "Anyone can view product analytics" ON public.product_analytics FOR SELECT USING (true);
CREATE POLICY "System can manage product analytics" ON public.product_analytics FOR ALL USING (true);

-- Update the apply_coupon_to_order trigger to handle commission properly
CREATE OR REPLACE FUNCTION public.apply_coupon_to_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  creator_user_id UUID;
  creator_commission_rate NUMERIC;
  commission_amount NUMERIC;
BEGIN
  -- If a coupon code is provided, find the creator
  IF NEW.coupon_code IS NOT NULL THEN
    SELECT p.user_id, p.commission_rate 
    INTO creator_user_id, creator_commission_rate
    FROM public.profiles p
    WHERE p.coupon_code = NEW.coupon_code AND p.is_creator = true;
    
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