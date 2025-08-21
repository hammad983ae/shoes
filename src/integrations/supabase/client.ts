// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // Surface a visible error in dev
  console.error('❌ Missing Supabase env vars. Check .env: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  throw new Error('Missing Supabase env vars');
}

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sb-auth', // keep short and unique
  },
});

// Helper function to wake up backend
export const wakeUpBackend = async () => {
  try {
    const { error } = await supabase.functions.invoke('wake-up-backend');
    if (error) {
      console.warn('Backend wake-up failed:', error);
    } else {
      console.log('✅ Backend is awake');
    }
  } catch (error) {
    console.warn('Backend wake-up error:', error);
  }
};
