-- Update the correct user account to admin
UPDATE public.profiles 
SET 
  role = 'admin',
  updated_at = now()
WHERE user_id = '839ca932-95d8-40ef-a899-36251837cfbd';

-- If no profile exists for this user, create one
INSERT INTO public.profiles (user_id, display_name, role, is_creator, created_at, updated_at)
SELECT 
  '839ca932-95d8-40ef-a899-36251837cfbd',
  'santinoscales',
  'admin',
  false,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE user_id = '839ca932-95d8-40ef-a899-36251837cfbd'
);