-- Function to clear cart when order is completed
CREATE OR REPLACE FUNCTION clear_cart_on_order_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Clear cart when order status changes to 'paid'
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    DELETE FROM public.cart WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically clear cart on successful order
DROP TRIGGER IF EXISTS trigger_clear_cart_on_order_completion ON public.orders;
CREATE TRIGGER trigger_clear_cart_on_order_completion
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION clear_cart_on_order_completion();