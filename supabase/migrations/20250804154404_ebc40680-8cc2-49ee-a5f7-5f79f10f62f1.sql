-- Fix function search path security warnings
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.update_post_engagement() SET search_path = '';
ALTER FUNCTION public.initialize_user_credits() SET search_path = '';

-- Create contact_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on contact_requests
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contact_requests
DROP POLICY IF EXISTS "Anyone can insert contact requests" ON public.contact_requests;
CREATE POLICY "Anyone can insert contact requests" ON public.contact_requests
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view contact requests" ON public.contact_requests;
CREATE POLICY "Authenticated users can view contact requests" ON public.contact_requests
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create indexes for contact_requests if they don't exist
CREATE INDEX IF NOT EXISTS idx_contact_requests_email ON public.contact_requests(email);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON public.contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON public.contact_requests(created_at);

-- Create trigger for contact_requests updated_at
DROP TRIGGER IF EXISTS update_contact_requests_updated_at ON public.contact_requests;
CREATE TRIGGER update_contact_requests_updated_at 
    BEFORE UPDATE ON public.contact_requests 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure profiles table has proper trigger for auto-creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, referral_code, accepted_terms)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'referral_code',
    COALESCE((NEW.raw_user_meta_data ->> 'accepted_terms')::boolean, false)
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger for auto profile creation if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();