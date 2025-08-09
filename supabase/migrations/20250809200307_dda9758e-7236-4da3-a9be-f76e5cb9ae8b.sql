-- Bootstrap admin user and fix admin loss issues
-- First, ensure stxrfo@gmail.com is always admin
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Find the user ID for stxrfo@gmail.com from auth.users
    SELECT au.id INTO target_user_id 
    FROM auth.users au 
    WHERE au.email = 'stxrfo@gmail.com';
    
    IF target_user_id IS NOT NULL THEN
        -- Ensure profile exists and is admin
        INSERT INTO public.profiles (user_id, role, is_creator, display_name)
        VALUES (target_user_id, 'admin', true, 'Santino')
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            role = 'admin',
            is_creator = true,
            display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
            updated_at = now();
    END IF;
END $$;

-- Create coupon_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.coupon_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(creator_id),
    UNIQUE(LOWER(code))
);

-- Enable RLS on coupon_codes
ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for coupon_codes - only admins can manage
CREATE POLICY "Only admins can manage coupon codes" 
ON public.coupon_codes 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Create admin-safe function to get current user role without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
SET search_path TO ''
AS $$
    SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Create function to safely manage coupon codes
CREATE OR REPLACE FUNCTION public.admin_set_coupon_code(
    target_user_id UUID,
    new_code TEXT
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
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
$$;

-- Create function to safely promote users to creator
CREATE OR REPLACE FUNCTION public.admin_set_creator_status(
    target_user_id UUID,
    is_creator_status BOOLEAN,
    new_role TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    -- Only admins can call this function
    IF NOT is_admin() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin access required');
    END IF;
    
    -- Update creator status and role if provided
    UPDATE public.profiles 
    SET 
        is_creator = is_creator_status,
        role = COALESCE(new_role, role),
        updated_at = now()
    WHERE user_id = target_user_id;
    
    RETURN jsonb_build_object('success', true);
END;
$$;

-- Add trigger to update coupon_codes timestamp
CREATE OR REPLACE FUNCTION public.update_coupon_codes_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_coupon_codes_updated_at
    BEFORE UPDATE ON public.coupon_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_coupon_codes_updated_at();