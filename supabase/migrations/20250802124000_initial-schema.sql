-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create posts table for user content
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  sneaker_tags TEXT[],
  brand_tags TEXT[],
  category_tags TEXT[],
  image_url TEXT,
  media_url TEXT,
  engagement_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  show_socials BOOLEAN DEFAULT true,
  show_username BOOLEAN DEFAULT true,
  post_type TEXT DEFAULT 'social_link'
);

-- Create transactions table for purchase tracking
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_details JSONB,
  amount DECIMAL(10,2) NOT NULL,
  credits_earned INTEGER DEFAULT 0,
  credits_spent INTEGER DEFAULT 0,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'credit_earn', 'credit_spend')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_credits table for credit tracking
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create following system
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create post interactions for engagement tracking
CREATE TABLE public.post_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'view', 'share')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id, interaction_type)
);

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

-- Create posts_products table to link posts to products
CREATE TABLE public.posts_products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL,
    product_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

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

-- Create social_connections table
CREATE TABLE public.social_connections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    username TEXT NOT NULL,
    profile_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, platform)
);

-- Create top_posts table
CREATE TABLE public.top_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    platform TEXT NOT NULL,
    platform_post_id TEXT NOT NULL,
    author_username TEXT NOT NULL,
    crowlix_user_id UUID REFERENCES auth.users(id),
    title TEXT,
    description TEXT,
    original_url TEXT,
    thumbnail_url TEXT,
    video_url TEXT,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    credits_earned INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0,
    posted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(platform, platform_post_id)
);

-- Create post_analytics table
CREATE TABLE public.post_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    top_post_id UUID NOT NULL REFERENCES public.top_posts(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL,
    interaction_value INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, top_post_id, interaction_type)
);

-- Create referrals table
CREATE TABLE public.referrals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    credits_earned INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(referred_user_id)
);

-- Create user_settings table
CREATE TABLE public.user_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'friends', 'private')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Create product_reviews table
CREATE TABLE public.product_reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Users can view all posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User credits policies
CREATE POLICY "Users can view their own credits" ON public.user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own credits" ON public.user_credits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own credits" ON public.user_credits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Users can view all reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Follow policies
CREATE POLICY "Users can view all follows" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Users can create their own follows" ON public.user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their own follows" ON public.user_follows FOR DELETE USING (auth.uid() = follower_id);

-- Post interactions policies
CREATE POLICY "Users can view all interactions" ON public.post_interactions FOR SELECT USING (true);
CREATE POLICY "Users can create their own interactions" ON public.post_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own interactions" ON public.post_interactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own interactions" ON public.post_interactions FOR DELETE USING (auth.uid() = user_id);

-- Purchase history policies
CREATE POLICY "Users can view their own purchase history" ON public.purchase_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own purchase records" ON public.purchase_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Posts products policies
CREATE POLICY "Everyone can view posts-products links" ON public.posts_products FOR SELECT USING (true);
CREATE POLICY "Users can create posts-products links" ON public.posts_products FOR INSERT WITH CHECK (true);

-- User posts policies
CREATE POLICY "Everyone can view user posts" ON public.user_posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own posts" ON public.user_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.user_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.user_posts FOR DELETE USING (auth.uid() = user_id);

-- Social connections policies
CREATE POLICY "Users can view all social connections" ON public.social_connections FOR SELECT USING (true);
CREATE POLICY "Users can manage their own social connections" ON public.social_connections FOR ALL USING (auth.uid() = user_id);

-- Top posts policies
CREATE POLICY "Everyone can view top posts" ON public.top_posts FOR SELECT USING (true);
CREATE POLICY "Users can create top posts" ON public.top_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update top posts" ON public.top_posts FOR UPDATE USING (true);

-- Post analytics policies
CREATE POLICY "Users can view their own analytics" ON public.post_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own analytics" ON public.post_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referrals policies
CREATE POLICY "Users can view their own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);
CREATE POLICY "Users can create referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_user_id);

-- User settings policies
CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

-- Product reviews policies
CREATE POLICY "Users can view all product reviews" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Users can manage their own product reviews" ON public.product_reviews FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON public.user_follows(following_id);
CREATE INDEX idx_post_interactions_post_id ON public.post_interactions(post_id);
CREATE INDEX idx_post_interactions_user_id ON public.post_interactions(user_id);
CREATE INDEX idx_purchase_history_user_id ON public.purchase_history(user_id);
CREATE INDEX idx_purchase_history_product_id ON public.purchase_history(product_id);
CREATE INDEX idx_posts_products_post_id ON public.posts_products(post_id);
CREATE INDEX idx_posts_products_product_id ON public.posts_products(product_id);
CREATE INDEX idx_user_posts_user_id ON public.user_posts(user_id);
CREATE INDEX idx_user_posts_product_id ON public.user_posts(product_id);
CREATE INDEX idx_user_posts_created_at ON public.user_posts(created_at);
CREATE INDEX idx_social_connections_user_id ON public.social_connections(user_id);
CREATE INDEX idx_top_posts_platform ON public.top_posts(platform);
CREATE INDEX idx_post_analytics_user_id ON public.post_analytics(user_id);
CREATE INDEX idx_post_analytics_top_post_id ON public.post_analytics(top_post_id);
CREATE INDEX idx_referrals_referrer_user_id ON public.referrals(referrer_user_id);
CREATE INDEX idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);

-- Create function to update updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON public.user_credits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_posts_updated_at BEFORE UPDATE ON public.user_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_social_connections_updated_at BEFORE UPDATE ON public.social_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_top_posts_updated_at BEFORE UPDATE ON public.top_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update engagement score
CREATE OR REPLACE FUNCTION public.update_post_engagement()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts 
  SET engagement_score = (
    SELECT COUNT(*) 
    FROM public.post_interactions 
    WHERE post_id = NEW.post_id
  )
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update engagement score
CREATE TRIGGER update_engagement_on_interaction
  AFTER INSERT OR DELETE ON public.post_interactions
  FOR EACH ROW EXECUTE FUNCTION public.update_post_engagement();

-- Initialize user credits when profile is created
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, current_balance, total_earned, total_spent)
  VALUES (NEW.user_id, 0, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER initialize_credits_on_profile_creation
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_credits();

-- Storage bucket 'user-posts' already exists from previous migration
-- Storage policies for user-posts bucket already exist
