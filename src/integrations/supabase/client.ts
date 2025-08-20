import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment variables validation
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Development logging
if (import.meta.env.DEV) {
  console.log('🔌 Supabase client configured with URL:', SUPABASE_URL);
}

// Create and export the Supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
});

// Helper function to wake up backend (keep existing functionality)
export const wakeUpBackend = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('wake-up-backend');
    if (error) {
      console.warn('Backend wake-up failed:', error);
    } else {
      console.log('✅ Backend is awake');
    }
  } catch (error) {
    console.warn('Backend wake-up error:', error);
  }
};
