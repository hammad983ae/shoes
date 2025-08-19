-- Sync coupon codes from profiles to coupon_codes table
INSERT INTO public.coupon_codes (creator_id, code, created_at, updated_at)
SELECT user_id, coupon_code, created_at, updated_at
FROM public.profiles 
WHERE coupon_code IS NOT NULL 
AND is_creator = true
ON CONFLICT (creator_id) DO UPDATE SET
  code = EXCLUDED.code,
  updated_at = now();