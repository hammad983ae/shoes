-- Find and update santino9109@gmail.com to admin role
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'santino9109@gmail.com'
);