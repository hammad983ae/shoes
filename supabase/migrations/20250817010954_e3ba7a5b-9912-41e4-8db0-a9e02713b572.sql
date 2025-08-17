-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  limited BOOLEAN DEFAULT FALSE,
  size_type TEXT DEFAULT 'US' CHECK (size_type IN ('EU', 'US', 'UK', 'ONE_SIZE')),
  price NUMERIC NOT NULL,
  stock INTEGER DEFAULT 0,
  filters JSONB DEFAULT '{}',
  materials TEXT,
  care_instructions TEXT,
  shipping_time TEXT DEFAULT '5-9 days',
  availability TEXT DEFAULT 'In Stock',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_media table
CREATE TABLE IF NOT EXISTS public.product_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  role TEXT DEFAULT 'gallery' CHECK (role IN ('primary', 'gallery', 'whatsapp')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table 
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price_per_item NUMERIC NOT NULL,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table for marketing
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('meta_ads', 'tiktok_ads', 'email', 'discount')),
  platform TEXT,
  name TEXT NOT NULL,
  spend NUMERIC DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  roas NUMERIC DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credits_history table 
CREATE TABLE IF NOT EXISTS public.credits_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  action TEXT NOT NULL,
  credits INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('in', 'out')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payouts table
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create videos table for creator content
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create checklist_items table
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products (public read, admin write)
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Create RLS policies for product_media (public read, admin write)
CREATE POLICY "Anyone can view product media" ON public.product_media FOR SELECT USING (true);
CREATE POLICY "Admins can manage product media" ON public.product_media FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Create RLS policies for order_items (users can view their own, admins can view all)
CREATE POLICY "Users can view their order items" ON public.order_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (is_admin());
CREATE POLICY "System can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Create RLS policies for campaigns (admin only)
CREATE POLICY "Admins can manage campaigns" ON public.campaigns FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Create RLS policies for credits_history (users can view their own)
CREATE POLICY "Users can view their credits history" ON public.credits_history FOR SELECT 
  USING (auth.uid() = profile_id);
CREATE POLICY "System can create credits history" ON public.credits_history FOR INSERT WITH CHECK (true);

-- Create RLS policies for payouts (users can view their own, admins can manage)
CREATE POLICY "Users can view their payouts" ON public.payouts FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can request payouts" ON public.payouts FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Admins can manage payouts" ON public.payouts FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Create RLS policies for videos (users can manage their own)
CREATE POLICY "Users can manage their videos" ON public.videos FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Create RLS policies for checklist_items (users can manage their own)
CREATE POLICY "Users can manage their checklist items" ON public.checklist_items FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Create trigger for updated_at on campaigns
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert product data from sneakerCatalog
INSERT INTO public.products (id, title, description, brand, category, limited, size_type, price, stock, filters, materials, care_instructions, shipping_time, availability) VALUES
('11111111-1111-1111-1111-111111111111', 'DRKSHDW Rick Owens Vans', 'This isn''t just a sneaker — it''s a rebellion stitched in canvas. The Rick Owens DRKSHDW x Vans turns the classic skate shoe into a bold, brutalist silhouette.', 'Rick Owens', 'Rick Owens', false, 'US', 195, 50, '{"keywords": ["black", "high-top", "distressed", "streetwear", "avant-garde", "collaboration"], "colors": ["black"], "type": "high-top"}', 'Premium leather and canvas construction', 'Clean with soft brush, avoid water exposure', '5-9 days', 'In Stock'),
('22222222-2222-2222-2222-222222222222', 'Maison Margiela Gum Sole Sneakers', 'The sneaker that does everything… without screaming for attention. The Maison Margiela Replica Gum Sole Sneakers blend quiet luxury with military precision.', 'Maison Margiela', 'Maison Margiela', false, 'EU', 170, 75, '{"keywords": ["white", "low-top", "gum sole", "minimalist", "deconstructed", "premium"], "colors": ["white"], "type": "low-top"}', 'Premium leather and gum sole construction', 'Clean with soft cloth, avoid harsh chemicals', '5-9 days', 'In Stock'),
('33333333-3333-3333-3333-333333333333', 'Rick Owens Geobaskets', 'Not just sneakers — a statement. The Rick Owens Geobaskets are an underground icon in the fashion world.', 'Rick Owens', 'Rick Owens', false, 'EU', 200, 30, '{"keywords": ["black", "high-top", "leather", "avant-garde", "statement", "premium"], "colors": ["black"], "type": "high-top"}', 'Premium leather construction with signature design elements', 'Clean with leather cleaner, avoid water exposure', '5-9 days', 'In Stock'),
('44444444-4444-4444-4444-444444444444', 'Travis Scott x Jordan 1 Low OG "Reverse Mocha"', 'The hype is real — and it''s not going anywhere. The Travis Scott Reverse Mocha Lows flip the script on one of the most iconic sneaker collabs of all time.', 'Nike', 'Nike', true, 'US', 165, 25, '{"keywords": ["mocha", "brown", "low-top", "collaboration", "limited-edition", "suede", "leather"], "colors": ["mocha", "brown"], "type": "low-top"}', 'Premium suede and leather construction', 'Clean with suede brush, avoid water exposure', '5-9 days', 'In Stock')
ON CONFLICT (id) DO NOTHING;