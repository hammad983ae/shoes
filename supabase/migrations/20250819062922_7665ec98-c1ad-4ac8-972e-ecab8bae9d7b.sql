-- Function to sync last_login_at from auth.users
CREATE OR REPLACE FUNCTION sync_user_last_login()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update last_login_at for all users based on auth.users.last_sign_in_at
  UPDATE public.profiles 
  SET last_login_at = auth_users.last_sign_in_at,
      updated_at = now()
  FROM auth.users AS auth_users
  WHERE profiles.user_id = auth_users.id
  AND (profiles.last_login_at IS NULL OR profiles.last_login_at != auth_users.last_sign_in_at);
END;
$$;

-- Function to update last_login_at when user signs in
CREATE OR REPLACE FUNCTION update_profile_last_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update last_login_at when last_sign_in_at changes in auth.users
  IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
    UPDATE public.profiles 
    SET last_login_at = NEW.last_sign_in_at,
        updated_at = now()
    WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update last_login_at
DROP TRIGGER IF EXISTS trigger_update_profile_last_login ON auth.users;
CREATE TRIGGER trigger_update_profile_last_login
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_last_login();

-- Sync all existing last login data
SELECT sync_user_last_login();