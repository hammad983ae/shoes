-- Check current posts table structure and add needed columns
-- Add missing columns to posts table if they don't exist
DO $$ 
BEGIN
    -- Add view_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'view_count') THEN
        ALTER TABLE posts ADD COLUMN view_count integer DEFAULT 0;
    END IF;
    
    -- Add like_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'like_count') THEN
        ALTER TABLE posts ADD COLUMN like_count integer DEFAULT 0;
    END IF;
    
    -- Add caption column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'caption') THEN
        ALTER TABLE posts ADD COLUMN caption text;
    END IF;
    
    -- Add product_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'product_id') THEN
        ALTER TABLE posts ADD COLUMN product_id text;
    END IF;
END $$;

-- Create post_likes table for tracking likes
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(post_id, user_id)
);

-- Enable RLS on post_likes
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for post_likes
CREATE POLICY "Users can view all post likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can create their own likes" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Create post_views table for tracking views
CREATE TABLE IF NOT EXISTS post_views (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(post_id, user_id)
);

-- Enable RLS on post_views
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- Create policies for post_views
CREATE POLICY "Users can view all post views" ON post_views FOR SELECT USING (true);
CREATE POLICY "Anyone can create post views" ON post_views FOR INSERT WITH CHECK (true);

-- Create function to update like count
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts 
        SET like_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = NEW.post_id)
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts 
        SET like_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = OLD.post_id)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update view count
CREATE OR REPLACE FUNCTION update_post_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE posts 
    SET view_count = (SELECT COUNT(*) FROM post_views WHERE post_id = NEW.post_id)
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating counts
DROP TRIGGER IF EXISTS trigger_update_like_count ON post_likes;
CREATE TRIGGER trigger_update_like_count
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

DROP TRIGGER IF EXISTS trigger_update_view_count ON post_views;
CREATE TRIGGER trigger_update_view_count
    AFTER INSERT ON post_views
    FOR EACH ROW EXECUTE FUNCTION update_post_view_count();