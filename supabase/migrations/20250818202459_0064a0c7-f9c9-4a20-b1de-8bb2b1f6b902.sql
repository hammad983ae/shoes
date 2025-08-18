-- Add slashed_price column to products table
ALTER TABLE public.products 
ADD COLUMN slashed_price NUMERIC(10,2) NULL;