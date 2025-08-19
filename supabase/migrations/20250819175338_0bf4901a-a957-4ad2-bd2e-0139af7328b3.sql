-- Find and update santino9109@gmail.com to be admin and creator
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get the user ID for santino9109@gmail.com
    SELECT user_id INTO target_user_id 
    FROM public.profiles p
    JOIN auth.users u ON p.user_id = u.id 
    WHERE u.email = 'santino9109@gmail.com';
    
    -- If user found, update their status
    IF target_user_id IS NOT NULL THEN
        -- Set as admin and creator
        UPDATE public.profiles 
        SET 
            role = 'admin',
            is_creator = true,
            commission_rate = 0.15, -- Set tier2 commission rate
            creator_tier = 'tier2',
            updated_at = now()
        WHERE user_id = target_user_id;
        
        -- Generate coupon code if they don't have one
        UPDATE public.profiles 
        SET coupon_code = public.generate_referral_code(8)
        WHERE user_id = target_user_id AND coupon_code IS NULL;
        
        -- Insert into coupon_codes table if not exists
        INSERT INTO public.coupon_codes (creator_id, code, updated_at)
        SELECT target_user_id, coupon_code, now()
        FROM public.profiles 
        WHERE user_id = target_user_id
        ON CONFLICT (creator_id) DO NOTHING;
        
        RAISE NOTICE 'Successfully updated santino9109@gmail.com to admin and creator status';
    ELSE
        RAISE NOTICE 'User santino9109@gmail.com not found';
    END IF;
END $$;