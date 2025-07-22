-- Create social connections table
CREATE TABLE public.social_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'x', 'reddit')),
  username TEXT NOT NULL,
  platform_user_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, platform)
);

-- Enable RLS on social_connections
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for social_connections
CREATE POLICY "Users can view their own social connections" 
ON public.social_connections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own social connections" 
ON public.social_connections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social connections" 
ON public.social_connections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social connections" 
ON public.social_connections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create top_posts table for social media posts
CREATE TABLE public.top_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'x', 'reddit')),
  platform_post_id TEXT NOT NULL,
  original_url TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_platform_id TEXT,
  crowlix_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  credits_earned INTEGER DEFAULT 0,
  tag_mentions TEXT[],
  hashtags TEXT[],
  posted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  imported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(platform, platform_post_id)
);

-- Enable RLS on top_posts
ALTER TABLE public.top_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for top_posts
CREATE POLICY "Everyone can view top posts" 
ON public.top_posts 
FOR SELECT 
USING (true);

-- Only system can insert/update top posts (for automated imports)
CREATE POLICY "System can manage top posts" 
ON public.top_posts 
FOR ALL 
USING (false);

-- Create post_analytics table for tracking user earnings
CREATE TABLE public.post_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  top_post_id UUID NOT NULL REFERENCES public.top_posts(id) ON DELETE CASCADE,
  credits_earned INTEGER NOT NULL DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  engagement_multiplier DECIMAL(3,2) DEFAULT 1.0,
  bonus_credits INTEGER DEFAULT 0,
  UNIQUE(user_id, top_post_id)
);

-- Enable RLS on post_analytics
ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for post_analytics
CREATE POLICY "Users can view their own analytics" 
ON public.post_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create user_settings table for privacy and notification settings
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  privacy_profile_visible BOOLEAN DEFAULT true,
  privacy_posts_visible BOOLEAN DEFAULT true,
  privacy_analytics_visible BOOLEAN DEFAULT false,
  notifications_email BOOLEAN DEFAULT true,
  notifications_push BOOLEAN DEFAULT true,
  notifications_credits BOOLEAN DEFAULT true,
  notifications_social_mentions BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_settings
CREATE POLICY "Users can manage their own settings" 
ON public.user_settings 
FOR ALL 
USING (auth.uid() = user_id);