-- Add referral system columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN referral_code TEXT UNIQUE,
ADD COLUMN referred_by TEXT,
ADD COLUMN referrals_count INTEGER DEFAULT 0;

-- Create index for referral code lookups
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generate 8 character alphanumeric code
        code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists_check;
        
        -- Exit loop if code is unique
        IF NOT exists_check THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$;

-- Update existing profiles to have referral codes
UPDATE public.profiles 
SET referral_code = public.generate_referral_code() 
WHERE referral_code IS NULL;

-- Function to handle referral when user signs up
CREATE OR REPLACE FUNCTION public.handle_referral_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    referrer_id UUID;
    ref_code TEXT;
BEGIN
    -- Extract referral code from user metadata
    ref_code := NEW.raw_user_meta_data ->> 'referral_code';
    
    IF ref_code IS NOT NULL THEN
        -- Find the referrer
        SELECT user_id INTO referrer_id 
        FROM public.profiles 
        WHERE referral_code = ref_code;
        
        IF referrer_id IS NOT NULL THEN
            -- Update the new user's referred_by
            UPDATE public.profiles 
            SET referred_by = ref_code 
            WHERE user_id = NEW.id;
            
            -- Increment referrer's count
            UPDATE public.profiles 
            SET referrals_count = referrals_count + 1 
            WHERE user_id = referrer_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for referral handling
CREATE TRIGGER on_referral_signup
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
    EXECUTE FUNCTION public.handle_referral_signup();