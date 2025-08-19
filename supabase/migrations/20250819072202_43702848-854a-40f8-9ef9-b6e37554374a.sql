-- Fix the payout_video_credits function to write to the correct tables
CREATE OR REPLACE FUNCTION public.payout_video_credits(creator_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  highest_tier_credits INTEGER := 0;
  credits_added INTEGER;
BEGIN
  -- Only admins can trigger payouts
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Get the highest payout tier from user's verified social connections
  SELECT payout_tier_credits INTO highest_tier_credits
  FROM public.social_connections 
  WHERE user_id = creator_user_id 
  ORDER BY payout_tier_credits DESC 
  LIMIT 1;
  
  -- If no social connections, use default tier (under 10k)
  IF highest_tier_credits IS NULL THEN
    highest_tier_credits := 2000; -- $20 default
  END IF;
  
  credits_added := highest_tier_credits;
  
  -- Update the main credits field in profiles table
  UPDATE public.profiles
  SET 
    credits = credits + credits_added,
    updated_at = now()
  WHERE user_id = creator_user_id;
  
  -- Add to credits history for dashboard display
  INSERT INTO public.credits_history (profile_id, action, type, credits, date)
  VALUES (creator_user_id, 'Video posted', 'earned', credits_added, CURRENT_DATE);
  
  -- Send notification
  INSERT INTO public.notifications (user_id, message)
  VALUES (creator_user_id, 'You received ' || credits_added || ' credits for posting a video! Keep creating content to earn more.');
  
  RETURN jsonb_build_object(
    'success', true, 
    'credits_added', credits_added,
    'tier_amount', highest_tier_credits
  );
END;
$function$;