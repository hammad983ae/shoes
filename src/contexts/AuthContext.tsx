import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type Profile = {
  user_id: string;
  display_name: string | null;
  role: 'user' | 'admin' | string;
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

  // prevent double refresh calls
  const refreshLock = useRef(false);

  // Subscribe to auth events + initial hydrate
  useEffect(() => {
    let mounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s ?? null);
      setUser(s?.user ?? null);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // On tab focus / visible, rehydrate/refresh session if needed
  useEffect(() => {
    const rehydrateOnFocus = async () => {
      if (refreshLock.current) return;
      refreshLock.current = true;
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          // try to refresh once
          await supabase.auth.refreshSession();
          const after = await supabase.auth.getSession();
          setSession(after.data.session ?? null);
          setUser(after.data.session?.user ?? null);
        } else {
          setSession(data.session);
          setUser(data.session.user);
        }
      } finally {
        refreshLock.current = false;
      }
    };

    const onFocus = () => void rehydrateOnFocus();
    const onVis = () => {
      if (document.visibilityState === 'visible') void rehydrateOnFocus();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // Load profile when session changes
  useEffect(() => {
    let mounted = true;
    const load = async (retry = false) => {
      if (!session?.user) {
        if (mounted) setProfile(null);
        return;
      }
      // do not block global loading state; page UIs can show their own skeletons
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, role, credits_cents, avatar_url')
        .eq('user_id', session.user.id)
        .single();

      if (!mounted) return;
      if (error) {
        // one retry after small delay (handles intermittent 406/401 when tab resumes)
        if (!retry) {
          setTimeout(() => load(true), 250);
        } else {
          console.warn('profile load failed:', error);
          // keep old profile instead of nulling it to avoid “U” fallback flicker
          // setProfile(null) // <- don’t
        }
      } else {
        setProfile(data as Profile);
      }
    };

    void load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // optional: add emailRedirectTo if you want a fixed callback
        // emailRedirectTo: 'https://<your-app>/auth/callback',
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      isAdmin: (profile?.role || '').toLowerCase() === 'admin',
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