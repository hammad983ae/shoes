-- Function to sync user total_spent from orders
CREATE OR REPLACE FUNCTION sync_user_total_spent()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update total_spent for all users based on their paid orders
  UPDATE public.profiles 
  SET total_spent = COALESCE(
    (SELECT SUM(order_total) 
     FROM public.orders 
     WHERE user_id = profiles.user_id 
     AND status = 'paid'), 
    0
  );
END;
$$;

-- Function to update total_spent when an order is paid
CREATE OR REPLACE FUNCTION update_user_total_spent()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only update when status changes to 'paid' or order_total changes for paid orders
  IF (NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid')) OR
     (NEW.status = 'paid' AND OLD.status = 'paid' AND NEW.order_total != OLD.order_total) THEN
    
    UPDATE public.profiles 
    SET total_spent = COALESCE(
      (SELECT SUM(order_total) 
       FROM public.orders 
       WHERE user_id = NEW.user_id 
       AND status = 'paid'), 
      0
    ),
    updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update total_spent
DROP TRIGGER IF EXISTS trigger_update_user_total_spent ON public.orders;
CREATE TRIGGER trigger_update_user_total_spent
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_user_total_spent();

-- Sync all existing user spending data
SELECT sync_user_total_spent();