import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

type Profile = {
  user_id: string;
  display_name: string;
  role: 'user' | 'admin';
  credits_cents: number;
  avatar_url: string | null;
};

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 6. Ensure AuthProvider waits for initial session properly
  useEffect(() => {
    let isMounted = true;
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSession(session || null);
        setUser(session?.user ?? null);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session || null);
        setUser(data.session?.user ?? null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // load profile
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      if (!session?.user) {
        if (isMounted) setProfile(null), setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, role, credits_cents, avatar_url')
        .eq('user_id', session.user.id)
        .single();

      if (!isMounted) return;
      if (error) {
        console.error('load profile', error);
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }
      setLoading(false);
    };
    load();
    return () => { isMounted = false; };
  }, [session?.user?.id]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || '' },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      isAdmin: profile?.role?.toLowerCase() === 'admin',
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [session, user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);