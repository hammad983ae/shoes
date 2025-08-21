import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type Profile = {
  user_id: string;
  display_name: string | null;
  role: string | null;
  credits_cents?: number | null;
  credits?: number | null;         // tolerate either column name
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

const AuthContext = createContext<AuthState>({} as any);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const refRefreshing = useRef(false);

  // 1) initial session + listener
  useEffect(() => {
    let mounted = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
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
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  // 2) hard rehydrate on tab focus/visibility
  useEffect(() => {
    const rehydrate = async () => {
      if (refRefreshing.current) return;
      refRefreshing.current = true;
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) await supabase.auth.refreshSession();
        const after = await supabase.auth.getSession();
        setSession(after.data.session ?? null);
        setUser(after.data.session?.user ?? null);
      } finally {
        refRefreshing.current = false;
      }
    };
    const onFocus = () => { void rehydrate(); };
    const onVis = () => { if (document.visibilityState === 'visible') void rehydrate(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // 3) load profile (retry once if 406/rls hiccup)
  useEffect(() => {
    let mounted = true;
    const load = async (retry = false) => {
      if (!user?.id) { if (mounted) setProfile(null); return; }
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, role, credits_cents, credits, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!mounted) return;
      if (error) {
        if (!retry) setTimeout(() => load(true), 250);
        else setProfile(null);
      } else {
        setProfile((data || null) as Profile | null);
      }
    };
    void load(false);
    return () => { mounted = false; };
  }, [user?.id]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };
  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: displayName || '' } }
    });
    return { error };
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const value = useMemo(() => ({
    session, user, profile,
    isAdmin: (profile?.role || '').toLowerCase() === 'admin',
    loading, signIn, signUp, signOut
  }), [session, user, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
