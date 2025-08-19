-- Use a session-level transaction to update the user
BEGIN;

-- Delete and recreate the profile to avoid trigger conflicts
DELETE FROM public.profiles WHERE user_id = '8fa4ceac-d3fc-47bd-96cf-ba0dc535735c';

INSERT INTO public.profiles (
    user_id, 
    role, 
    is_creator, 
    commission_rate, 
    creator_tier,
    display_name,
    referral_code,
    accepted_terms,
    credits,
    created_at,
    updated_at
) VALUES (
    '8fa4ceac-d3fc-47bd-96cf-ba0dc535735c',
    'admin',
    true,
    0.15,
    'tier2',
    'santino9109',
    'ADMIN001',
    true,
    0,
    now(),
    now()
);

COMMIT;