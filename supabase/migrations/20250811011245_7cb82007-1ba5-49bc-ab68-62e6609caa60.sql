-- Update the welcome notification to reflect successful email confirmation
CREATE OR REPLACE FUNCTION public.create_welcome_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, message)
  VALUES (NEW.user_id, 'Welcome to the platform! 🎉 You have successfully confirmed your email!');
  RETURN NEW;
END;
$$;