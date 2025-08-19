-- Update payout tier calculation function to include 1M+ tier
CREATE OR REPLACE FUNCTION public.calculate_payout_tier_credits(follower_count integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
AS $function$
BEGIN
  CASE 
    WHEN follower_count >= 1000000 THEN RETURN 15000; -- $150
    WHEN follower_count >= 500000 THEN RETURN 10000; -- $100
    WHEN follower_count >= 100000 THEN RETURN 7500;  -- $75
    WHEN follower_count >= 50000 THEN RETURN 5000;   -- $50
    WHEN follower_count >= 10000 THEN RETURN 3500;   -- $35
    ELSE RETURN 2000; -- $20 (under 10k)
  END CASE;
END;
$function$;