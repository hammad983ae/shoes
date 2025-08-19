-- 1. Ensure function exists in public schema with proper permissions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  );
$$;

-- 2. CRITICAL: Grant execute permissions to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 3. Ensure helper function also has proper permissions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated, anon;

-- 4. Fix the admin_set_coupon_code function with explicit schema references
CREATE OR REPLACE FUNCTION public.admin_set_coupon_code(target_user_id uuid, new_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    result JSONB;
    existing_creator UUID;
BEGIN
    -- Only admins can call this function - use explicit public schema
    IF NOT public.is_admin() THEN
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
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_coupon_code(uuid, text) TO authenticated;