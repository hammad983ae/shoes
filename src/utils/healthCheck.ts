import { supabase } from '@/integrations/supabase/client';

// 7. Health check utilities
export const performHealthCheck = async () => {
  if (process.env.NODE_ENV !== 'development') return;

  try {
    console.group('🔍 Supabase Health Check');

    // Check auth session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('Auth Session:', {
      hasSession: !!sessionData.session,
      userId: sessionData.session?.user?.id || 'null',
      error: sessionError?.message || 'none'
    });

    // Check whoami RPC
    try {
      const { data: whoamiData, error: whoamiError } = await supabase.rpc('whoami');
      console.log('Whoami RPC:', {
        userId: whoamiData || 'null',
        error: whoamiError?.message || 'none'
      });
    } catch (rpcError: any) {
      console.warn('Whoami RPC failed:', rpcError.message);
    }

    console.groupEnd();
  } catch (error: any) {
    console.error('Health check failed:', error);
  }
};