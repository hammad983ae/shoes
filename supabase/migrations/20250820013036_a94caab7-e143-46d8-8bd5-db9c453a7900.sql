-- FIX FUNCTION OVERLOADS AND ANY REMAINING SEARCH_PATH ISSUES
-- Some functions may have multiple signatures that need individual fixing

-- Get a complete list and fix any overloaded functions
DO $$
DECLARE
    func_record RECORD;
    func_count INTEGER := 0;
BEGIN
    -- Loop through all remaining security definer functions without search_path
    FOR func_record IN 
        SELECT n.nspname, p.proname, p.oid, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' 
        AND p.prosecdef = true 
        AND NOT (p.proconfig @> ARRAY['search_path='])
    LOOP
        -- Set search_path for each function by OID to handle overloads
        EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = %L', 
            func_record.nspname, 
            func_record.proname, 
            func_record.args,
            CASE 
                WHEN func_record.proname IN ('handle_new_user', 'update_user_total_spent', 'apply_coupon_to_order', 
                                            'calculate_estimated_delivery', 'clear_cart_on_order_completion',
                                            'admin_find_user_by_email', 'send_order_webhook', 'sync_user_last_login',
                                            'track_order_analytics', 'update_profile_last_login', 'update_updated_at_column')
                THEN 'public'  -- Trigger functions and functions that need table access
                ELSE ''        -- Security barrier functions
            END
        );
        func_count := func_count + 1;
        RAISE NOTICE 'Fixed search_path for function: %.%(%)', func_record.nspname, func_record.proname, func_record.args;
    END LOOP;
    
    RAISE NOTICE 'Completed fixing % functions with search_path settings', func_count;
END $$;