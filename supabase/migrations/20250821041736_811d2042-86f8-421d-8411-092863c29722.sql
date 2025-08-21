-- 2. Add referral support to the database
-- Add referral columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Create index on referral_code for performance
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);

-- Create RPC to get user's referral code
CREATE OR REPLACE FUNCTION public.get_my_referral_code()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT referral_code 
  FROM public.profiles 
  WHERE user_id = auth.uid();
$$;

-- Create RPC to generate referral code
CREATE OR REPLACE FUNCTION public.generate_my_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  -- Check if user already has a code
  SELECT referral_code INTO new_code
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  IF new_code IS NOT NULL THEN
    RETURN new_code;
  END IF;
  
  -- Generate new unique code
  LOOP
    new_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10));
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM public.profiles WHERE referral_code = new_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  -- Update user's profile with new code
  UPDATE public.profiles 
  SET referral_code = new_code 
  WHERE user_id = auth.uid();
  
  RETURN new_code;
END;
$$;

-- 4. Clean up storage policies (remove foldername-based ones)
-- Keep only the split_part based policies
DROP POLICY IF EXISTS "Users can manage their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage their own posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own posts" ON storage.objects;

-- Create cleaner storage policies using split_part
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL 
  AND split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL 
  AND split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL 
  AND split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Users can upload their own posts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-posts' 
  AND auth.uid() IS NOT NULL 
  AND split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Users can update their own posts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-posts' 
  AND auth.uid() IS NOT NULL 
  AND split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Users can delete their own posts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-posts' 
  AND auth.uid() IS NOT NULL 
  AND split_part(name, '/', 1) = auth.uid()::text
);