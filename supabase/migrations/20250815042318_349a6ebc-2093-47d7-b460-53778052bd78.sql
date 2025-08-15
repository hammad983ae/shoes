-- First check if is_admin function exists
SELECT proname 
FROM pg_proc 
WHERE proname = 'is_admin';

-- If it doesn't exist, let's create it
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  );
$function$;