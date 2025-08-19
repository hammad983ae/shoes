-- Drop the problematic trigger temporarily
DROP TRIGGER IF EXISTS auto_generate_coupon_code_trigger ON public.profiles;

-- Recreate the function to handle this conflict better
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
        
        -- Set the coupon code in the NEW record instead of doing another UPDATE
        NEW.coupon_code := new_code;
        
        -- Insert into coupon_codes table separately (this won't conflict)
        INSERT INTO public.coupon_codes (creator_id, code, updated_at)
        VALUES (NEW.user_id, new_code, now())
        ON CONFLICT (creator_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER auto_generate_coupon_code_trigger
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_coupon_code();