-- Update the handle_new_user function to generate referral codes and handle referrals properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
DECLARE
    referrer_id UUID;
    ref_code TEXT;
    new_referral_code TEXT;
BEGIN
    -- Generate a unique referral code for the new user
    new_referral_code := public.generate_referral_code();
    
    -- Extract referral code from user metadata if they signed up with one
    ref_code := NEW.raw_user_meta_data ->> 'referral_code';
    
    -- Insert new profile with generated referral code
    INSERT INTO public.profiles (user_id, display_name, referral_code, referred_by)
    VALUES (
        NEW.id, 
        NEW.raw_user_meta_data ->> 'display_name',
        new_referral_code,
        ref_code
    );
    
    -- If user signed up with referral code, increment referrer's count
    IF ref_code IS NOT NULL THEN
        -- Find the referrer and increment their count
        UPDATE public.profiles 
        SET referrals_count = referrals_count + 1 
        WHERE referral_code = ref_code;
    END IF;
    
    RETURN NEW;
END;
$$;