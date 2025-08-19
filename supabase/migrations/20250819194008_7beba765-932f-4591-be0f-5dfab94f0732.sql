-- Enable the pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to send order webhook to n8n
CREATE OR REPLACE FUNCTION send_order_webhook()
RETURNS TRIGGER AS $$
DECLARE
    webhook_url TEXT := 'http://n8n.cralluxsells.com:5678/webhook/new-order';
    payload JSONB;
    product_names TEXT[];
    product_images TEXT[];
    product_detail JSONB;
    product_record RECORD;
BEGIN
    -- Initialize arrays
    product_names := '{}';
    product_images := '{}';
    
    -- Extract product names and images from product_details
    IF NEW.product_details IS NOT NULL THEN
        FOR product_detail IN SELECT * FROM jsonb_array_elements(NEW.product_details)
        LOOP
            -- Try to find product by ID first, then by name
            SELECT name, images[1] INTO product_record
            FROM products 
            WHERE id::text = (product_detail->>'id')::text 
               OR id::text = (product_detail->>'product_id')::text
               OR title = (product_detail->>'name')::text
               OR title = (product_detail->>'title')::text
            LIMIT 1;
            
            -- If found, add to arrays
            IF product_record.name IS NOT NULL THEN
                product_names := array_append(product_names, product_record.name);
                -- Extract first image from images array if it exists
                IF product_record.images IS NOT NULL AND array_length(product_record.images, 1) > 0 THEN
                    product_images := array_append(product_images, product_record.images[1]);
                END IF;
            ELSE
                -- Fallback to product_detail name if no match found
                IF product_detail->>'name' IS NOT NULL THEN
                    product_names := array_append(product_names, product_detail->>'name');
                ELSIF product_detail->>'title' IS NOT NULL THEN
                    product_names := array_append(product_names, product_detail->>'title');
                END IF;
            END IF;
        END LOOP;
    END IF;
    
    -- Build the payload
    payload := jsonb_build_object(
        'order_id', NEW.id,
        'customer_name', COALESCE(NEW.shipping_address->>'name', 'Unknown Customer'),
        'shipping_address', NEW.shipping_address,
        'product_names', to_jsonb(product_names),
        'product_images', to_jsonb(product_images),
        'order_total', NEW.order_total,
        'status', NEW.status,
        'created_at', NEW.created_at
    );
    
    -- Send HTTP POST request to n8n webhook
    PERFORM net.http_post(
        url := webhook_url,
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := payload::text
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after insert on orders
DROP TRIGGER IF EXISTS trigger_send_order_webhook ON orders;
CREATE TRIGGER trigger_send_order_webhook
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION send_order_webhook();