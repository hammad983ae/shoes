-- Create purchase_history table to track user purchases
CREATE TABLE public.purchase_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    purchase_price NUMERIC NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    order_id TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on purchase_history
ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;

-- Create policies for purchase_history
CREATE POLICY "Users can view their own purchase history" 
ON public.purchase_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchase records" 
ON public.purchase_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_purchase_history_user_id ON public.purchase_history(user_id);
CREATE INDEX idx_purchase_history_product_id ON public.purchase_history(product_id);

-- Add review_images column to product_reviews table
ALTER TABLE public.product_reviews 
ADD COLUMN review_images TEXT[] DEFAULT '{}';

-- Create posts_products table to link posts to products
CREATE TABLE public.posts_products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL,
    product_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on posts_products
ALTER TABLE public.posts_products ENABLE ROW LEVEL SECURITY;

-- Create policies for posts_products
CREATE POLICY "Everyone can view posts-products links" 
ON public.posts_products 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create posts-products links" 
ON public.posts_products 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_posts_products_post_id ON public.posts_products(post_id);
CREATE INDEX idx_posts_products_product_id ON public.posts_products(product_id);

-- Add fields to posts table for user preferences
ALTER TABLE public.posts 
ADD COLUMN show_socials BOOLEAN DEFAULT true,
ADD COLUMN show_username BOOLEAN DEFAULT true,
ADD COLUMN post_type TEXT DEFAULT 'social_link', -- 'social_link' or 'upload'
ADD COLUMN media_url TEXT;

-- Create user_posts table to store custom uploaded posts
CREATE TABLE public.user_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    media_url TEXT,
    media_type TEXT, -- 'image' or 'video'
    product_id TEXT,
    show_socials BOOLEAN DEFAULT true,
    show_username BOOLEAN DEFAULT true,
    credits_earned INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_posts
ALTER TABLE public.user_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for user_posts
CREATE POLICY "Everyone can view user posts" 
ON public.user_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own posts" 
ON public.user_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.user_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.user_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on user_posts
CREATE TRIGGER update_user_posts_updated_at
BEFORE UPDATE ON public.user_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_posts_user_id ON public.user_posts(user_id);
CREATE INDEX idx_user_posts_product_id ON public.user_posts(product_id);
CREATE INDEX idx_user_posts_created_at ON public.user_posts(created_at);