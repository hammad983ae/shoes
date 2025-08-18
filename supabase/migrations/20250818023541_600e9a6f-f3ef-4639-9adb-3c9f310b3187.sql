-- Fix the foreign key issue by dropping and recreating the favorites table with correct types
DROP TABLE IF EXISTS public.favorites CASCADE;

CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own favorites" ON public.favorites 
FOR ALL USING (auth.uid() = user_id);

-- Fix the estimated delivery trigger
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

-- Add analytics table for tracking
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

ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view product analytics" ON public.product_analytics FOR SELECT USING (true);
CREATE POLICY "System can manage product analytics" ON public.product_analytics FOR ALL USING (true);