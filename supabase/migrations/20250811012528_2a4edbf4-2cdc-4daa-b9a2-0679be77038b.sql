-- Fix search path security issues for functions
CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts 
        SET like_count = (SELECT COUNT(*) FROM public.post_likes WHERE post_id = NEW.post_id)
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts 
        SET like_count = (SELECT COUNT(*) FROM public.post_likes WHERE post_id = OLD.post_id)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_post_view_count()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    UPDATE public.posts 
    SET view_count = (SELECT COUNT(*) FROM public.post_views WHERE post_id = NEW.post_id)
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_referral_code(len integer DEFAULT 8)
RETURNS text 
LANGUAGE plpgsql 
STABLE
SET search_path = ''
AS $function$
declare
  alphabet constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  code text := '';
  i int;
  tries int := 0;
begin
  loop
    code := '';
    for i in 1..len loop
      code := code || substr(alphabet, 1 + floor(random()*length(alphabet))::int, 1);
    end loop;

    -- ensure not in use (nulls allowed)
    if not exists (select 1 from public.profiles p where p.referral_code = code) then
      return code;
    end if;

    tries := tries + 1;
    if tries > 5 then
      -- extremely unlikely, but bail with a longer code
      return code || substr(alphabet, 1 + floor(random()*length(alphabet))::int, 2);
    end if;
  end loop;
end
$function$;