-- Directly update the specific fields for santino9109@gmail.com
UPDATE public.profiles 
SET role = 'admin'
WHERE user_id = '8fa4ceac-d3fc-47bd-96cf-ba0dc535735c';

UPDATE public.profiles 
SET is_creator = true
WHERE user_id = '8fa4ceac-d3fc-47bd-96cf-ba0dc535735c';

UPDATE public.profiles 
SET commission_rate = 0.15
WHERE user_id = '8fa4ceac-d3fc-47bd-96cf-ba0dc535735c';

UPDATE public.profiles 
SET creator_tier = 'tier2'
WHERE user_id = '8fa4ceac-d3fc-47bd-96cf-ba0dc535735c';