-- Fix function security issues by replacing the function properly

-- Replace the function without dropping it
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Replace calculate_estimated_delivery function  
CREATE OR REPLACE FUNCTION public.calculate_estimated_delivery()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set estimated delivery to 12 days from order creation initially
  IF NEW.estimated_delivery IS NULL THEN
    NEW.estimated_delivery = (NEW.created_at + INTERVAL '12 days')::date;
  END IF;
  
  -- Update to 7 days when status changes to shipped
  IF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
    NEW.estimated_delivery = (now() + INTERVAL '7 days')::date;
  END IF;
  
  RETURN NEW;
END;
$$;