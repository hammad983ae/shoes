-- Fix credit synchronization by ensuring single source of truth
-- Add analytics tracking tables
CREATE TABLE IF NOT EXISTS public.site_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  metric_value numeric DEFAULT 0,
  date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on analytics
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view analytics" ON public.site_analytics FOR SELECT USING (true);
CREATE POLICY "System can manage analytics" ON public.site_analytics FOR ALL USING (true);

-- Fix coupon codes to include discount amount tracking
ALTER TABLE public.coupon_codes ADD COLUMN IF NOT EXISTS total_used_amount numeric DEFAULT 0;
ALTER TABLE public.coupon_codes ADD COLUMN IF NOT EXISTS total_uses integer DEFAULT 0;

-- Create a unified credits view to synchronize creator and user credits
CREATE OR REPLACE VIEW public.unified_credits AS
SELECT 
  uc.user_id,
  uc.current_balance,
  uc.total_earned,
  uc.total_spent,
  uc.earned_from_referrals,
  uc.video_credits_this_month,
  uc.lifetime_video_credits,
  p.is_creator,
  p.creator_tier,
  p.commission_rate
FROM public.user_credits uc
LEFT JOIN public.profiles p ON uc.user_id = p.user_id;

-- Update order processing to track analytics
CREATE OR REPLACE FUNCTION public.track_order_analytics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Track order analytics when status changes to paid
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    -- Update daily revenue
    INSERT INTO public.site_analytics (metric_type, metric_value, date)
    VALUES ('daily_revenue', NEW.order_total, CURRENT_DATE)
    ON CONFLICT (metric_type, date) 
    DO UPDATE SET 
      metric_value = site_analytics.metric_value + NEW.order_total,
      updated_at = now();
    
    -- Update daily orders
    INSERT INTO public.site_analytics (metric_type, metric_value, date)
    VALUES ('daily_orders', 1, CURRENT_DATE)
    ON CONFLICT (metric_type, date) 
    DO UPDATE SET 
      metric_value = site_analytics.metric_value + 1,
      updated_at = now();
    
    -- Track coupon usage if applicable
    IF NEW.coupon_code IS NOT NULL THEN
      UPDATE public.coupon_codes 
      SET 
        total_uses = total_uses + 1,
        total_used_amount = total_used_amount + COALESCE(NEW.coupon_discount, 0),
        usage_count = usage_count + 1
      WHERE code = NEW.coupon_code;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order analytics
DROP TRIGGER IF EXISTS track_order_analytics_trigger ON public.orders;
CREATE TRIGGER track_order_analytics_trigger
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.track_order_analytics();

-- Add unique constraint to site_analytics for metric_type and date
ALTER TABLE public.site_analytics ADD CONSTRAINT unique_metric_date UNIQUE (metric_type, date);