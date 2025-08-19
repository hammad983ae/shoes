-- Temporarily disable triggers and update in one statement
ALTER TABLE public.profiles DISABLE TRIGGER ALL;

UPDATE public.profiles 
SET 
    role = 'admin',
    is_creator = true,
    commission_rate = 0.15,
    creator_tier = 'tier2',
    updated_at = now()
WHERE user_id = '8fa4ceac-d3fc-47bd-96cf-ba0dc535735c';

ALTER TABLE public.profiles ENABLE TRIGGER ALL;