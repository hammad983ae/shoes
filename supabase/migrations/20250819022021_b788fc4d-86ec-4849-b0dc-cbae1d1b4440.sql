-- Add color column to products table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'color') THEN
        ALTER TABLE public.products ADD COLUMN color TEXT;
    END IF;
END $$;