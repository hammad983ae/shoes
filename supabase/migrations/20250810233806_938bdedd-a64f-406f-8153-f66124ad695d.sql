-- Create admin function to delete user account completely
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    result jsonb;
BEGIN
    -- Check if the requesting user is deleting their own account
    IF auth.uid() != target_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Can only delete your own account');
    END IF;
    
    -- Delete from profiles table first (this will cascade to other tables if properly set up)
    DELETE FROM public.profiles WHERE user_id = target_user_id;
    
    -- Delete from user_credits table
    DELETE FROM public.user_credits WHERE user_id = target_user_id;
    
    -- Delete from user_settings table
    DELETE FROM public.user_settings WHERE user_id = target_user_id;
    
    -- Delete from posts table
    DELETE FROM public.posts WHERE user_id = target_user_id;
    
    -- Delete from any other user-related tables
    DELETE FROM public.notifications WHERE user_id = target_user_id;
    DELETE FROM public.transactions WHERE user_id = target_user_id;
    DELETE FROM public.referrals WHERE referrer_user_id = target_user_id OR referred_user_id = target_user_id;
    
    RETURN jsonb_build_object('success', true, 'message', 'Profile data deleted successfully');
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'Failed to delete profile data: ' || SQLERRM);
END;
$function$;