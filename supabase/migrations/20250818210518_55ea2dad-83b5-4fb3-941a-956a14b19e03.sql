-- Add display_order column to product_media table
ALTER TABLE public.product_media 
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Update existing records to have sequential order numbers
UPDATE public.product_media 
SET display_order = sub.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY created_at) as row_num
  FROM public.product_media
) sub
WHERE public.product_media.id = sub.id;