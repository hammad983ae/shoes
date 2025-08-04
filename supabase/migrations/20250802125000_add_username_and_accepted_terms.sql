-- Add username and accepted_terms fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username TEXT,
ADD COLUMN accepted_terms BOOLEAN DEFAULT false;

-- Create unique index on username to ensure uniqueness
CREATE UNIQUE INDEX idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    display_name,
    username,
    accepted_terms,
    referral_code
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'username',
    COALESCE((NEW.raw_user_meta_data->>'accepted_terms')::boolean, false),
    NEW.raw_user_meta_data->>'referral_code'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 