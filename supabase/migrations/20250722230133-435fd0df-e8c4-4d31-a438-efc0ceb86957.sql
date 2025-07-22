-- Add agreed_to_terms column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN agreed_to_terms boolean DEFAULT false;