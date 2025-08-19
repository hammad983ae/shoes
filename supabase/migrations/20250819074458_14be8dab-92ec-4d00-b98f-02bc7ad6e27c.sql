-- Add unique constraint on user_id for cart table
-- This ensures each user can only have one cart
ALTER TABLE public.cart ADD CONSTRAINT cart_user_id_unique UNIQUE (user_id);