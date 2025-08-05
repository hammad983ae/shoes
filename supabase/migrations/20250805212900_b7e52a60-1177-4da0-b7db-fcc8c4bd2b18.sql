-- Generate unique referral codes for existing users without them
UPDATE profiles 
SET referral_code = SUBSTRING(MD5(user_id::text || NOW()::text) FROM 1 FOR 8)
WHERE referral_code IS NULL;

-- Create function to generate referral code automatically
CREATE OR REPLACE FUNCTION generate_referral_code() RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate 8 character alphanumeric code
        new_code := SUBSTRING(MD5(RANDOM()::text || NOW()::text) FROM 1 FOR 8);
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = new_code) INTO code_exists;
        
        -- Exit loop if code is unique
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Update the handle_new_user function to always generate a referral code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    referrer_id UUID;
    provided_referral_code TEXT;
BEGIN
    -- Get the referral code from user metadata
    provided_referral_code := NEW.raw_user_meta_data ->> 'referral_code';
    
    -- Find the referrer if a referral code was provided
    IF provided_referral_code IS NOT NULL THEN
        SELECT user_id INTO referrer_id 
        FROM public.profiles 
        WHERE referral_code = provided_referral_code;
    END IF;
    
    INSERT INTO public.profiles (user_id, display_name, referral_code, accepted_terms, referred_by)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
        generate_referral_code(), -- Always generate a unique referral code
        COALESCE((NEW.raw_user_meta_data ->> 'accepted_terms')::boolean, false),
        referrer_id -- Set referred_by if we found a referrer
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    -- If this user was referred, increment the referrer's count
    IF referrer_id IS NOT NULL THEN
        UPDATE public.profiles 
        SET referrals_count = COALESCE(referrals_count, 0) + 1
        WHERE user_id = referrer_id;
        
        -- Create a referral record
        INSERT INTO public.referrals (referrer_user_id, referred_user_id, referral_code, status)
        VALUES (referrer_id, NEW.id, provided_referral_code, 'completed');
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create function to handle referral credits when someone makes their first purchase
CREATE OR REPLACE FUNCTION handle_referral_purchase()
RETURNS TRIGGER AS $$
DECLARE
    referrer_id UUID;
    is_first_purchase BOOLEAN;
    referral_credits INTEGER;
    purchase_amount NUMERIC;
BEGIN
    -- Check if this is the user's first purchase
    SELECT COUNT(*) = 1 INTO is_first_purchase
    FROM transactions 
    WHERE user_id = NEW.user_id AND transaction_type = 'purchase';
    
    -- Only process referral credits for first purchase
    IF is_first_purchase THEN
        -- Get the referrer for this user
        SELECT referred_by INTO referrer_id
        FROM profiles
        WHERE user_id = NEW.user_id AND referred_by IS NOT NULL;
        
        IF referrer_id IS NOT NULL THEN
            -- Calculate 20% of purchase amount as credits (1 dollar = 100 credits)
            purchase_amount := NEW.amount;
            referral_credits := FLOOR(purchase_amount * 20); -- 20% of amount in credits
            
            -- Add credits to referrer
            UPDATE user_credits
            SET 
                current_balance = current_balance + referral_credits,
                earned_from_referrals = earned_from_referrals + referral_credits,
                total_earned = total_earned + referral_credits,
                updated_at = NOW()
            WHERE user_id = referrer_id;
            
            -- Update the referral record with credits earned
            UPDATE referrals
            SET 
                credits_earned = referral_credits,
                completed_at = NOW()
            WHERE referrer_user_id = referrer_id AND referred_user_id = NEW.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for handling referral purchases
DROP TRIGGER IF EXISTS referral_purchase_trigger ON transactions;
CREATE TRIGGER referral_purchase_trigger
    AFTER INSERT ON transactions
    FOR EACH ROW
    WHEN (NEW.transaction_type = 'purchase')
    EXECUTE FUNCTION handle_referral_purchase();