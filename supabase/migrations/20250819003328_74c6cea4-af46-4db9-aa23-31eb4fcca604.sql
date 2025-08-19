-- Sync credits between profiles and user_credits tables
-- Update profiles.credits to match user_credits.current_balance for user with ID 839ca932-95d8-40ef-a899-36251837cfbd

UPDATE profiles 
SET credits = (
  SELECT current_balance 
  FROM user_credits 
  WHERE user_credits.user_id = profiles.user_id
)
WHERE user_id = '839ca932-95d8-40ef-a899-36251837cfbd'
AND EXISTS (
  SELECT 1 FROM user_credits 
  WHERE user_credits.user_id = profiles.user_id
);