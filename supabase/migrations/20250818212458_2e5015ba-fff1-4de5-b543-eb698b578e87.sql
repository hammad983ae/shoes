-- Add slug column to products table
ALTER TABLE public.products 
ADD COLUMN slug TEXT;

-- Create a function to generate URL-friendly slugs
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    TRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ), 
      '-'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Generate slugs for existing products
UPDATE public.products 
SET slug = generate_slug(title) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL;

-- Create unique index on slug
CREATE UNIQUE INDEX idx_products_slug ON public.products(slug);

-- Add trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION update_product_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update slug if title changed or slug is null
  IF NEW.slug IS NULL OR (OLD.title IS DISTINCT FROM NEW.title) THEN
    NEW.slug := generate_slug(NEW.title) || '-' || SUBSTRING(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_slug
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_slug();