-- Set Santino as both admin and creator
UPDATE public.profiles 
SET is_creator = true, role = 'admin' 
WHERE user_id = '839ca932-95d8-40ef-a899-36251837cfbd';