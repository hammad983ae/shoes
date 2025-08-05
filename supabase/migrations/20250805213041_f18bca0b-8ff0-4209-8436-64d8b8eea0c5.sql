-- Fix search path for security
CREATE OR REPLACE FUNCTION generate_referral_code() RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate 8 character alphanumeric code
        new_code := SUBSTRING(MD5(RANDOM()::text || NOW()::text) FROM 1 FOR 8);
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO code_exists;
        
        -- Exit loop if code is unique
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix search path for handle_referral_purchase
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
    FROM public.transactions 
    WHERE user_id = NEW.user_id AND transaction_type = 'purchase';
    
    -- Only process referral credits for first purchase
    IF is_first_purchase THEN
        -- Get the referrer for this user
        SELECT referred_by INTO referrer_id
        FROM public.profiles
        WHERE user_id = NEW.user_id AND referred_by IS NOT NULL;
        
        IF referrer_id IS NOT NULL THEN
            -- Calculate 20% of purchase amount as credits (1 dollar = 100 credits)
            purchase_amount := NEW.amount;
            referral_credits := FLOOR(purchase_amount * 20); -- 20% of amount in credits
            
            -- Add credits to referrer
            UPDATE public.user_credits
            SET 
                current_balance = current_balance + referral_credits,
                earned_from_referrals = earned_from_referrals + referral_credits,
                total_earned = total_earned + referral_credits,
                updated_at = NOW()
            WHERE user_id = referrer_id;
            
            -- Update the referral record with credits earned
            UPDATE public.referrals
            SET 
                credits_earned = referral_credits,
                completed_at = NOW()
            WHERE referrer_user_id = referrer_id AND referred_user_id = NEW.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';