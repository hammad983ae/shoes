import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL!;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// SINGLETON
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sb-auth', // DO NOT CHANGE later or you'll "lose" the session
  },
});

// optional: helpers you can use anywhere
export const getSession = () => supabase.auth.getSession();
export const getUser = () => supabase.auth.getUser();