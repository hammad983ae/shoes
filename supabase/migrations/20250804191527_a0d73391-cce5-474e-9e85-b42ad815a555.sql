-- Fix function search path for create_welcome_notification
CREATE OR REPLACE FUNCTION public.create_welcome_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, message)
  VALUES (NEW.user_id, 'Welcome to the platform! ✅ Please confirm your email to get started.');
  RETURN NEW;
END;
$$;