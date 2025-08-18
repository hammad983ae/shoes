-- Create missing tables and fix schema issues

-- 1. Create favorites table for favorites functionality
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for favorites
CREATE POLICY "Users can manage their own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- 2. Add missing columns to existing tables

-- Add shipping address and product details to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_address JSONB,
ADD COLUMN IF NOT EXISTS product_details JSONB,
ADD COLUMN IF NOT EXISTS order_images TEXT[],
ADD COLUMN IF NOT EXISTS estimated_delivery DATE;

-- 3. Create coupon_usage table for tracking coupon usage
CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coupon_code TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  discount_percentage NUMERIC NOT NULL DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on coupon_usage
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for coupon_usage
CREATE POLICY "Users can view their own coupon usage" ON public.coupon_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create coupon usage records" ON public.coupon_usage
  FOR INSERT WITH CHECK (true);

-- 4. Add discount column to coupon_codes table
ALTER TABLE public.coupon_codes 
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC DEFAULT 15,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_usage INTEGER DEFAULT NULL;

-- 5. Create payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_last_four TEXT NOT NULL,
  card_brand TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on payment_methods
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_methods
CREATE POLICY "Users can manage their own payment methods" ON public.payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- 6. Create wallet_transactions table for credit reloads
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  credits_added INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('reload', 'purchase', 'refund')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method_id UUID REFERENCES public.payment_methods(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on wallet_transactions
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for wallet_transactions
CREATE POLICY "Users can view their own wallet transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wallet transactions" ON public.wallet_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Add TikTok integration columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tiktok_username TEXT,
ADD COLUMN IF NOT EXISTS tiktok_followers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tiktok_verified BOOLEAN DEFAULT false;

-- 8. Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for tables that need updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON public.orders 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON public.payment_methods;
CREATE TRIGGER update_payment_methods_updated_at 
  BEFORE UPDATE ON public.payment_methods 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Create function to handle estimated delivery calculation
CREATE OR REPLACE FUNCTION public.calculate_estimated_delivery()
RETURNS TRIGGER AS $$
BEGIN
  -- Set estimated delivery to 12 days from order creation initially
  IF NEW.estimated_delivery IS NULL THEN
    NEW.estimated_delivery = (NEW.created_at + INTERVAL '12 days')::date;
  END IF;
  
  -- Update to 7 days when status changes to shipped
  IF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
    NEW.estimated_delivery = (now() + INTERVAL '7 days')::date;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for estimated delivery calculation
DROP TRIGGER IF EXISTS calculate_delivery_date ON public.orders;
CREATE TRIGGER calculate_delivery_date 
  BEFORE INSERT OR UPDATE ON public.orders 
  FOR EACH ROW EXECUTE FUNCTION public.calculate_estimated_delivery();