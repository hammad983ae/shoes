import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AuthRefresh = () => {
  const { user, session } = useAuth();

  useEffect(() => {
    const refreshAuth = async () => {
      try {
        // Force refresh the session
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Session refresh error:', error);
          // Sign out and back in
          await supabase.auth.signOut();
          toast.error('Session expired. Please sign in again.');
          return;
        }

        // Check if profile exists
        if (data.session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.session.user.id)
            .single();

          if (profileError || !profile) {
            console.error('Profile error:', profileError);
            toast.error('Profile not found. Please contact support.');
          } else {
            console.log('Profile found:', profile);
            toast.success('Authentication refreshed successfully');
          }
        }
      } catch (error) {
        console.error('Auth refresh error:', error);
      }
    };

    // Only run if user is logged in but having issues
    if (user && session) {
      refreshAuth();
    }
  }, [user, session]);

  return null;
};

export default AuthRefresh;