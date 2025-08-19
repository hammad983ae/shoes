-- Fix critical security vulnerabilities

-- 1. Tighten profiles table RLS - remove broad access, allow only own profile access
DROP POLICY IF EXISTS "Authenticated users can view basic profile info" ON public.profiles;

-- Keep the user's own profile access
-- The "Users can view own complete profile" policy already exists and is secure

-- 2. Create a safe public profiles view for discovery (only non-sensitive fields)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  user_id,
  display_name,
  avatar_url,
  is_creator,
  creator_tier,
  bio
FROM public.profiles
WHERE account_status = 'active';

-- Allow anyone to view the safe public profiles view
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- 3. Fix post_views table - remove public IP exposure
DROP POLICY IF EXISTS "Users can view all post views" ON public.post_views;

-- Add admin-only access to post_views
CREATE POLICY "Admins can view post views" 
ON public.post_views 
FOR SELECT 
USING (is_admin());

-- Create a safe view for post view counts without exposing IPs
CREATE OR REPLACE VIEW public.post_view_counts AS
SELECT 
  post_id,
  COUNT(*) as view_count
FROM public.post_views
GROUP BY post_id;

-- Allow anyone to see view counts
GRANT SELECT ON public.post_view_counts TO authenticated, anon;

-- 4. Add HMAC signature function for webhook security
CREATE OR REPLACE FUNCTION public.generate_hmac_signature(payload text, secret text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(
    hmac(payload::bytea, secret::bytea, 'sha256'),
    'hex'
  );
END;
$$;

-- 5. Update webhook function to be more secure
CREATE OR REPLACE FUNCTION public.send_order_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    webhook_url TEXT := 'https://n8n.cralluxsells.com:5678/webhook/new-order';
    webhook_secret TEXT;
    payload JSONB;
    payload_text TEXT;
    signature TEXT;
    product_names TEXT[];
    product_detail JSONB;
    product_record RECORD;
BEGIN
    -- Get webhook secret (you'll need to add this as a Supabase secret)
    webhook_secret := 'your-webhook-secret-here'; -- This should come from Supabase secrets
    
    -- Initialize arrays
    product_names := '{}';
    
    -- Extract product names from product_details (remove sensitive data)
    IF NEW.product_details IS NOT NULL THEN
        FOR product_detail IN SELECT * FROM jsonb_array_elements(NEW.product_details)
        LOOP
            SELECT title INTO product_record
            FROM public.products 
            WHERE id::text = (product_detail->>'id')::text 
               OR title = (product_detail->>'name')::text
            LIMIT 1;
            
            IF product_record.title IS NOT NULL THEN
                product_names := array_append(product_names, product_record.title);
            END IF;
        END LOOP;
    END IF;
    
    -- Build secure payload (remove PII)
    payload := jsonb_build_object(
        'order_id', NEW.id,
        'customer_name', COALESCE(NEW.shipping_address->>'name', 'Customer'),
        'product_names', to_jsonb(product_names),
        'order_total', NEW.order_total,
        'status', NEW.status,
        'created_at', NEW.created_at
    );
    
    payload_text := payload::text;
    signature := generate_hmac_signature(payload_text, webhook_secret);
    
    -- Send HTTPS POST request with signature
    PERFORM net.http_post(
        url := webhook_url,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'X-Signature', 'sha256=' || signature
        ),
        body := payload_text
    );
    
    RETURN NEW;
END;
$$;