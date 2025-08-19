-- Add coupon code for the new admin/creator
UPDATE public.profiles 
SET coupon_code = 'ADMIN001'
WHERE user_id = '8fa4ceac-d3fc-47bd-96cf-ba0dc535735c';

-- Also add to coupon_codes table
INSERT INTO public.coupon_codes (creator_id, code, updated_at)
VALUES ('8fa4ceac-d3fc-47bd-96cf-ba0dc535735c', 'ADMIN001', now())
ON CONFLICT (creator_id) DO UPDATE SET code = EXCLUDED.code;