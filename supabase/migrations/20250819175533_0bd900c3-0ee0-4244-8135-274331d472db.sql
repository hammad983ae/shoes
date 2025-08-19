-- Insert or update with conflict resolution
INSERT INTO public.profiles (
    user_id, 
    role, 
    is_creator, 
    commission_rate, 
    creator_tier,
    display_name,
    created_at,
    updated_at
) 
VALUES (
    '8fa4ceac-d3fc-47bd-96cf-ba0dc535735c',
    'admin',
    true,
    0.15,
    'tier2',
    'santino9109',
    now(),
    now()
)
ON CONFLICT (user_id) 
DO UPDATE SET 
    role = EXCLUDED.role,
    is_creator = EXCLUDED.is_creator,
    commission_rate = EXCLUDED.commission_rate,
    creator_tier = EXCLUDED.creator_tier,
    updated_at = now();