-- Fix the ambiguous column reference in payout_video_credits function
CREATE OR REPLACE FUNCTION public.payout_video_credits(creator_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  highest_tier_credits INTEGER := 0;
  social_conn RECORD;
  credits_added INTEGER;
  user_current_balance INTEGER := 0;  -- Renamed to avoid column name conflict
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
  
  -- Add credits to user using admin_grant type (which is valid)
  INSERT INTO public.credits_ledger (user_id, amount, type, notes, admin_id)
  VALUES (creator_user_id, credits_added, 'admin_grant', 'Credits for posting a video', auth.uid());
  
  -- Get current balance if user_credits record exists
  SELECT current_balance INTO user_current_balance
  FROM public.user_credits
  WHERE user_id = creator_user_id;
  
  -- If user doesn't have a credits record, create one
  IF user_current_balance IS NULL THEN
    INSERT INTO public.user_credits (user_id, current_balance, total_earned, total_spent)
    VALUES (creator_user_id, credits_added, credits_added, 0);
  ELSE
    -- Update existing record
    UPDATE public.user_credits
    SET 
      current_balance = current_balance + credits_added,
      total_earned = total_earned + credits_added,
      updated_at = now()
    WHERE user_id = creator_user_id;
  END IF;
  
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