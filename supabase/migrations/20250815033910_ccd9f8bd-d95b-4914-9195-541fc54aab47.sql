-- Fix admin functions for coupon code management
CREATE OR REPLACE FUNCTION public.admin_set_coupon_code(target_user_id uuid, new_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    result JSONB;
    existing_creator UUID;
BEGIN
    -- Only admins can call this function
    IF NOT is_admin() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin access required');
    END IF;
    
    -- Validate code format
    IF new_code IS NULL OR length(trim(new_code)) = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Coupon code cannot be empty');
    END IF;
    
    -- Normalize code to uppercase
    new_code := upper(trim(new_code));
    
    -- Check if code is already in use by another creator
    SELECT creator_id INTO existing_creator 
    FROM public.coupon_codes 
    WHERE LOWER(code) = LOWER(new_code) AND creator_id != target_user_id;
    
    IF existing_creator IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Coupon code already in use');
    END IF;
    
    -- Upsert the coupon code
    INSERT INTO public.coupon_codes (creator_id, code, updated_at)
    VALUES (target_user_id, new_code, now())
    ON CONFLICT (creator_id) 
    DO UPDATE SET 
        code = EXCLUDED.code,
        updated_at = now();
    
    -- Also update the profiles table coupon_code field for backwards compatibility
    UPDATE public.profiles 
    SET coupon_code = new_code, updated_at = now()
    WHERE user_id = target_user_id;
    
    RETURN jsonb_build_object('success', true, 'code', new_code);
END;
$function$;

-- Function to auto-generate coupon codes for new creators
CREATE OR REPLACE FUNCTION public.auto_generate_coupon_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    new_code TEXT;
BEGIN
    -- Only generate if user is becoming a creator and doesn't have a code
    IF NEW.is_creator = true AND (OLD.is_creator = false OR OLD.is_creator IS NULL) AND NEW.coupon_code IS NULL THEN
        new_code := public.generate_referral_code(8);
        
        -- Update the profile with the new coupon code
        UPDATE public.profiles 
        SET coupon_code = new_code
        WHERE user_id = NEW.user_id;
        
        -- Also insert into coupon_codes table
        INSERT INTO public.coupon_codes (creator_id, code, updated_at)
        VALUES (NEW.user_id, new_code, now())
        ON CONFLICT (creator_id) DO NOTHING;
        
        NEW.coupon_code := new_code;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create trigger for auto-generating coupon codes
DROP TRIGGER IF EXISTS auto_generate_coupon_code_trigger ON public.profiles;
CREATE TRIGGER auto_generate_coupon_code_trigger
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_coupon_code();