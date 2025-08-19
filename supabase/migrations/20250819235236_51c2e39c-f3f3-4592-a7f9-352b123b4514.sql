-- Add missing admin helper function for promote-user-admin edge function
CREATE OR REPLACE FUNCTION public.admin_find_user_by_email(user_email text)
RETURNS TABLE(user_id uuid, email text, display_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only admins can call this function
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Find user by email in auth.users and get profile info
  RETURN QUERY
  SELECT 
    p.user_id,
    au.email,
    p.display_name
  FROM public.profiles p
  JOIN auth.users au ON p.user_id = au.id
  WHERE au.email = user_email
  LIMIT 1;
END;
$$;

-- Fix security definer views by making them regular views
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
SELECT 
  user_id,
  display_name,
  avatar_url,
  is_creator,
  creator_tier,
  bio
FROM public.profiles
WHERE account_status = 'active';

DROP VIEW IF EXISTS public.post_view_counts;
CREATE VIEW public.post_view_counts AS
SELECT 
  post_id,
  COUNT(*) as view_count
FROM public.post_views
GROUP BY post_id;

-- Add storage RLS policies for user-posts bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-posts', 'user-posts', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Create storage policies for user-posts bucket
CREATE POLICY "Users can upload their own posts" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'user-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own posts" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'user-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all user posts" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'user-posts' AND is_admin());