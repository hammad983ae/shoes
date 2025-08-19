-- Make santinoscales (stxrfo@gmail.com) an admin user
UPDATE public.profiles 
SET 
  role = 'admin',
  updated_at = now()
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'stxrfo@gmail.com'
);