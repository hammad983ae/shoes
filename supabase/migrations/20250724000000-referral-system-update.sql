-- Create dedicated referrals table for better tracking
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add earned_from_referrals to user_credits table
ALTER TABLE public.user_credits 
ADD COLUMN IF NOT EXISTS earned_from_referrals INTEGER DEFAULT 0;

-- Create index for referral code lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_user_id ON public.referrals(referrer_user_id);

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
        -- Generate 6-8 character alphanumeric code
        code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));
        
        -- Check if code already exists in referrals table
        SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = code) INTO exists_check;
        
        -- Exit loop if code is unique
        IF NOT exists_check THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$;

-- Function to handle new user signup with referral
CREATE OR REPLACE FUNCTION public.handle_new_user_with_referral()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
DECLARE
    referrer_id UUID;
    ref_code TEXT;
    new_referral_code TEXT;
    referrer_referral_id UUID;
BEGIN
    -- Extract referral code from user metadata if they signed up with one
    ref_code := NEW.raw_user_meta_data ->> 'referral_code';
    
    -- Generate a unique referral code for the new user
    new_referral_code := public.generate_referral_code();
    
    -- Insert new profile
    INSERT INTO public.profiles (user_id, display_name, referral_code, referred_by)
    VALUES (
        NEW.id, 
        NEW.raw_user_meta_data ->> 'display_name',
        new_referral_code,
        ref_code
    );
    
    -- Create referral record for the new user
    INSERT INTO public.referrals (referrer_user_id, referral_code)
    VALUES (NEW.id, new_referral_code);
    
    -- If user signed up with referral code, handle the referral
    IF ref_code IS NOT NULL THEN
        -- Find the referrer's referral record
        SELECT id INTO referrer_referral_id
        FROM public.referrals 
        WHERE referral_code = ref_code;
        
        IF referrer_referral_id IS NOT NULL THEN
            -- Get referrer's user_id
            SELECT referrer_user_id INTO referrer_id
            FROM public.referrals 
            WHERE id = referrer_referral_id;
            
            -- Increment referrer's count in profiles
            UPDATE public.profiles 
            SET referrals_count = referrals_count + 1 
            WHERE user_id = referrer_id;
        END IF;
    END IF;
    
    -- Initialize user_credits for the new user
    INSERT INTO public.user_credits (user_id, current_balance, total_earned, total_spent, earned_from_referrals)
    VALUES (NEW.id, 0, 0, 0, 0);
    
    RETURN NEW;
END;
$$;

-- Function to handle referral purchase credits
CREATE OR REPLACE FUNCTION public.handle_referral_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    referrer_id UUID;
    referral_credits INTEGER;
    current_balance INTEGER;
    current_total_earned INTEGER;
    current_earned_from_referrals INTEGER;
BEGIN
    -- Only process if this is a purchase transaction
    IF NEW.transaction_type = 'purchase' THEN
        -- Get the user's referred_by code
        SELECT referred_by INTO ref_code
        FROM public.profiles 
        WHERE user_id = NEW.user_id;
        
        IF ref_code IS NOT NULL THEN
            -- Find the referrer
            SELECT referrer_user_id INTO referrer_id
            FROM public.referrals 
            WHERE referral_code = ref_code;
            
            IF referrer_id IS NOT NULL THEN
                -- Calculate 20% of purchase amount as credits
                referral_credits := FLOOR(NEW.amount * 0.2 * 100);
                
                -- Get current credits for referrer
                SELECT current_balance, total_earned, earned_from_referrals 
                INTO current_balance, current_total_earned, current_earned_from_referrals
                FROM public.user_credits 
                WHERE user_id = referrer_id;
                
                -- Update referrer's credits
                UPDATE public.user_credits 
                SET 
                    current_balance = COALESCE(current_balance, 0) + referral_credits,
                    total_earned = COALESCE(current_total_earned, 0) + referral_credits,
                    earned_from_referrals = COALESCE(current_earned_from_referrals, 0) + referral_credits
                WHERE user_id = referrer_id;
                
                -- Log the referral transaction
                INSERT INTO public.transactions (
                    user_id, 
                    product_name, 
                    amount, 
                    credits_earned, 
                    transaction_type,
                    product_details
                ) VALUES (
                    referrer_id,
                    'Referral Credit',
                    0,
                    referral_credits,
                    'credit_earn',
                    jsonb_build_object(
                        'referral_type', 'purchase_referral',
                        'referred_user_id', NEW.user_id,
                        'original_purchase_amount', NEW.amount,
                        'referral_code', ref_code
                    )
                );
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_new_user_signup ON auth.users;
CREATE TRIGGER on_new_user_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_with_referral();

-- Create trigger for referral purchase handling
DROP TRIGGER IF EXISTS on_referral_purchase ON public.transactions;
CREATE TRIGGER on_referral_purchase
    AFTER INSERT ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_referral_purchase();

-- Update existing profiles to have referral codes if they don't have them
UPDATE public.profiles 
SET referral_code = public.generate_referral_code() 
WHERE referral_code IS NULL;

-- Create referral records for existing users who don't have them
INSERT INTO public.referrals (referrer_user_id, referral_code)
SELECT user_id, referral_code 
FROM public.profiles 
WHERE referral_code IS NOT NULL
AND user_id NOT IN (SELECT referrer_user_id FROM public.referrals);

-- Ensure all users have user_credits records
INSERT INTO public.user_credits (user_id, current_balance, total_earned, total_spent, earned_from_referrals)
SELECT user_id, 0, 0, 0, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_credits); 