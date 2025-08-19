-- Simple update to make santino9109@gmail.com admin and creator
UPDATE public.profiles 
SET 
    role = 'admin',
    is_creator = true,
    commission_rate = 0.15,
    creator_tier = 'tier2',
    updated_at = now()
WHERE user_id IN (
    SELECT u.id 
    FROM auth.users u 
    WHERE u.email = 'santino9109@gmail.com'
);